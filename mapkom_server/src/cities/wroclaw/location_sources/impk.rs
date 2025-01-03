use crate::{
    HTTP_CLIENT,
    cities::{City, Line, LocationSource, VehicleLocation, VehicleType, wroclaw::Wroclaw},
    geometry::point::Point,
};
use chrono::{DateTime, NaiveDateTime, Utc};
use chrono_tz::Europe::Warsaw;
use color_eyre::{Result, eyre::ContextCompat};
use diqwest::WithDigestAuth;
use serde::Deserialize;
use tracing::instrument;

// API extracted from https://play.google.com/store/apps/details?id=pl.wasko.android.mpk

const BASE_URL: &str = "https://impk.mpk.wroc.pl:8088/mobile?function=";
const DIGEST_USERNAME: &str = "android-mpk";
const DIGEST_PASSWORD: &str = "g5crehAfUCh4Wust";

#[derive(Deserialize, Debug)]
struct ImpkApiResponse {
    #[serde(rename = "v")]
    code: u32,

    #[serde(rename = "c")]
    course: u64,

    #[serde(rename = "y")]
    lat: f64,

    #[serde(rename = "x")]
    lng: f64,

    #[serde(rename = "l")]
    line: String,

    #[serde(rename = "t")]
    vehicle_type: VehicleType,

    #[serde(rename = "s")]
    symbol: String,

    #[serde(rename = "d")]
    direction: String,

    #[serde(rename = "e")]
    delay: i64,
}

pub struct ImpkApiSource {
    cache: Vec<VehicleLocation>,
    last_updated_at: DateTime<Utc>,
}

impl LocationSource for ImpkApiSource {
    async fn new() -> Result<Self>
    where
        Self: Sized,
    {
        Ok(Self {
            cache: Vec::new(),
            last_updated_at: DateTime::from_timestamp_nanos(0),
        })
    }

    #[instrument(name = "impk_refresh", skip(self), level = "debug")]
    async fn refresh(&mut self) -> Result<DateTime<Utc>> {
        let (latest_updated_at, locations) = self.fetch().await?;

        self.cache = locations;
        self.last_updated_at = latest_updated_at;

        Ok(self.last_updated_at)
    }

    fn query(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        (self.last_updated_at, &self.cache)
    }
}

impl ImpkApiSource {
    async fn fetch(&self) -> Result<(DateTime<Utc>, Vec<VehicleLocation>)> {
        let response = HTTP_CLIENT
            .get(format!("{}getPositions&shortcut=true", BASE_URL))
            .send_with_digest_auth(DIGEST_USERNAME, DIGEST_PASSWORD)
            .await?
            .text()
            .await?;

        let values: Vec<serde_json::Value> = serde_json::from_str(response.as_str())?;

        let date = NaiveDateTime::parse_from_str(
            values
                .first()
                .and_then(|x| x.as_str())
                .context("Couldn't get index 0 from API response")?,
            "%Y-%m-%d %H:%M:%S",
        )?
        .and_local_timezone(Warsaw)
        .single()
        .context("Local timezone conversion failed")?
        .to_utc();

        let vehicles: Vec<ImpkApiResponse> = serde_json::from_value(serde_json::Value::Array(
            values.into_iter().skip(1).collect(),
        ))?;

        let locations = vehicles
            .into_iter()
            .map(|item| -> Result<VehicleLocation> {
                Ok(VehicleLocation {
                    fleet_number: Some(item.code),
                    plate_number: None,
                    line: Line {
                        number: Some(item.line),
                        direction: None,
                        brigade: None,
                        vehicle_type: Some(item.vehicle_type),
                    },
                    course_id: Some(item.course),
                    delay: Some(item.delay),
                    current_stop: Some(item.symbol.parse()?),
                    next_stop: Some(item.direction.parse()?),
                    position: Point::new(item.lat, item.lng),
                    direction: None,
                    updated_at: Some(date),
                })
            })
            .collect::<Result<Vec<VehicleLocation>>>()?
            .into_iter()
            .filter(|x| Wroclaw::sanitize_coordinates(&x.position))
            .collect();

        Ok((date, locations))
    }
}
