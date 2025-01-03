use axum::{Json, extract::State};
use chrono::{DateTime, Utc};
use color_eyre::Result;
use serde::Serialize;
use utoipa::ToSchema;

use crate::error::AxumResult;

use super::CityMap;

/// Information about the service.
#[derive(ToSchema, Serialize)]
pub struct ApiStats {
    name: String,
    version: String,

    /// Build timestamp in RFC3339 format.
    build_timestamp: String,

    city_count: usize,
}

impl ApiStats {
    fn new(city_count: usize) -> Result<Self> {
        Ok(Self {
            name: env!("CARGO_PKG_NAME").to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            build_timestamp: DateTime::parse_from_rfc3339(env!("BUILD_TIMESTAMP"))?
                .with_timezone(&Utc)
                .to_rfc3339(),
            city_count,
        })
    }
}

/// Gets information about the service.
#[utoipa::path(
    method(get),
    path = "/stats",
    responses(
        (status = OK, description = "Success", body = ApiStats, content_type = "application/json")
    )
)]
pub async fn stats(State(city_map): State<CityMap>) -> AxumResult<Json<ApiStats>> {
    Ok(Json(ApiStats::new(city_map.len())?))
}
