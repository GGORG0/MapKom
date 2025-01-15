pub mod health;
pub mod stats;

use crate::{cities::CityMap, socketio};
use axum::{Router, response::Redirect, serve::Serve};
use color_eyre::Result;
use socketioxide::SocketIo;
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;
use utoipa::OpenApi;
use utoipa_axum::{router::OpenApiRouter, routes};
use utoipa_scalar::{Scalar, Servable as _};
use utoipa_swagger_ui::SwaggerUi;

#[derive(OpenApi)]
#[openapi()]
struct ApiDoc;

pub async fn main(city_map: CityMap) -> Result<(Serve<Router, Router>, SocketIo)> {
    // TODO: make CORS actually normal
    let cors_layer = CorsLayer::very_permissive();

    let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .routes(routes!(health::health))
        .routes(routes!(stats::stats))
        .layer(cors_layer.clone())
        .with_state(city_map.clone())
        .split_for_parts();

    let router =
        router.merge(SwaggerUi::new("/swagger-ui").url("/apidoc/openapi.json", api.clone()));
    let router = router.merge(Scalar::with_url("/scalar", api));

    let router = router.merge(Router::new().route(
        "/",
        axum::routing::get(|| async { Redirect::temporary("/scalar") }),
    ));

    let (socketio_layer, io) = socketio::init(city_map);
    let router = router.merge(
        Router::new().layer(
            ServiceBuilder::new()
                .layer(cors_layer)
                .layer(socketio_layer),
        ),
    );

    let listener = TcpListener::bind(
        std::env::var("MAPKOM_SERVER_ADDRESS").unwrap_or_else(|_| "0.0.0.0:8080".to_string()),
    )
    .await?;

    info!("Listening on {}", listener.local_addr()?);

    let start = axum::serve(listener, router);

    Ok((start, io))
}
