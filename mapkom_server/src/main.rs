#![allow(dead_code)]
#![deny(clippy::unwrap_used)]

pub mod api;
pub mod cities;
pub mod error;
pub mod geometry;
pub mod socketio;

use std::{collections::HashMap, sync::Arc};

use cities::{City, CityMap};
use color_eyre::{Result, config::HookBuilder};
use futures::future::join_all;
use once_cell::sync::Lazy;
use reqwest::Client;
use tracing::level_filters::LevelFilter;
use tracing_error::ErrorLayer;
use tracing_subscriber::{
    fmt::format::FmtSpan, layer::SubscriberExt as _, util::SubscriberInitExt,
};

static HTTP_CLIENT: Lazy<Client> = Lazy::new(|| {
    Client::builder()
        .user_agent(format!(
            "MapKom/{} (GGORG0@protonmail.com; https://ggorg.xyz)",
            env!("CARGO_PKG_VERSION")
        ))
        .build()
        .expect("Failed to create HTTP client")
});

#[tokio::main]
async fn main() -> Result<()> {
    init_eyre()?;
    init_tracing()?;

    let cities = vec![cities::wroclaw::Wroclaw::new().await?];

    let (cities, jobs): (Vec<_>, Vec<_>) = cities.into_iter().unzip();

    let cities: CityMap = Arc::new(HashMap::from_iter(
        join_all(cities.into_iter().map(|city| async {
            let slug = city.read().await.slug_self();
            (slug, city)
        }))
        .await,
    ));

    let (start, io) = api::main(cities).await?;

    for job in jobs {
        job(io.clone());
    }

    start.await?;

    Ok(())
}

fn init_eyre() -> Result<()> {
    HookBuilder::default()
        .capture_span_trace_by_default(true)
        .add_frame_filter(Box::new(|frames| {
            frames.retain(|frame| {
                let name = if let Some(name) = frame.filename.as_ref() {
                    name.to_string_lossy()
                } else {
                    return true;
                };

                name.contains(env!("CARGO_PKG_NAME"))
            });
        }))
        .install()
}

fn init_tracing() -> Result<()> {
    tracing_subscriber::Registry::default()
        .with(tracing_subscriber::fmt::layer().with_span_events(FmtSpan::NEW | FmtSpan::CLOSE))
        .with(ErrorLayer::default())
        .with(
            tracing_subscriber::EnvFilter::builder()
                .with_default_directive(
                    LevelFilter::INFO.into(),
                    // TODO: fix this
                    // format!("warn,{}=info", env!("CARGO_PKG_NAME")).parse()?
                )
                .from_env()?,
        )
        .try_init()?;

    Ok(())
}
