use crate::{
    HTTP_CLIENT,
    cities::{City as _, Line, LocationSource, VehicleLocation, VehicleType, wroclaw::Wroclaw},
    geometry::point::Point,
};
use chrono::{DateTime, Utc};
use color_eyre::{
    Result,
    eyre::{ContextCompat, format_err},
};
use scraper::{Html, Selector};
use serde::Deserialize;
use strum::IntoEnumIterator as _;
use tracing::instrument;

// API used by https://mpk.wroc.pl/strefa-pasazera/zaplanuj-podroz/mapa-pozycji-pojazdow

const SCRAPE_URL: &str =
    "https://mpk.wroc.pl/strefa-pasazera/zaplanuj-podroz/mapa-pozycji-pojazdow";
const SCRAPE_SELECTOR: &str = "div.bus-gps-lines.{} ul li.line";
const API_URL: &str = "https://mpk.wroc.pl/bus_position";

#[derive(Deserialize, Debug)]
struct MpkWebApiResponse {
    name: String,

    #[serde(rename = "type")]
    vehicle_type: VehicleType,

    #[serde(rename = "x")]
    lat: f64,

    #[serde(rename = "y")]
    lng: f64,

    #[serde(rename = "k")]
    course: u64,
}

pub struct MpkWebApiSource {
    lines: Vec<Line>,

    cache: Vec<VehicleLocation>,
    last_updated_at: DateTime<Utc>,
}

impl LocationSource for MpkWebApiSource {
    async fn new() -> Result<Self>
    where
        Self: Sized,
    {
        Ok(Self {
            lines: Self::fetch_lines().await?,

            cache: Vec::new(),
            last_updated_at: DateTime::from_timestamp_nanos(0),
        })
    }

    #[instrument(name = "mpk_web_refresh", skip(self), level = "debug")]
    async fn refresh(&mut self) -> Result<DateTime<Utc>> {
        let locations = self.fetch().await?;

        self.cache = locations;
        self.last_updated_at = Utc::now();

        Ok(self.last_updated_at)
    }

    fn query(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        (self.last_updated_at, &self.cache)
    }

    fn query_all(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        (self.last_updated_at, &self.cache)
    }
}

impl MpkWebApiSource {
    #[instrument(name = "mpk_web_fetch_lines")]
    async fn fetch_lines() -> Result<Vec<Line>> {
        let response = reqwest::get(SCRAPE_URL).await?.text().await?;
        let html = Html::parse_document(response.as_str());

        Ok(VehicleType::iter()
            .map(|vehicle_type| -> Result<_> {
                let selector = Selector::parse(
                    SCRAPE_SELECTOR
                        .replace("{}", vehicle_type.as_ref())
                        .as_str(),
                )
                .map_err(|x| format_err!("{}", x))?;

                html.select(&selector)
                    .map(|element| -> Result<_> {
                        let line = element
                            .text()
                            .next()
                            .context("Couldn't get line name from element")?
                            .to_string();

                        Ok(Line {
                            number: Some(line),
                            direction: None,
                            brigade: None,
                            vehicle_type: Some(vehicle_type.clone()),
                        })
                    })
                    .collect::<Result<Vec<Line>>>()
            })
            .collect::<Result<Vec<Vec<Line>>>>()?
            .into_iter()
            .flatten()
            .collect())
    }

    async fn fetch(&self) -> Result<Vec<VehicleLocation>> {
        let form_data: Vec<(String, String)> = self
            .lines
            .iter()
            .map(|line| -> Result<_> {
                Ok((
                    format!(
                        "busList[{}][]",
                        line.vehicle_type
                            .clone()
                            .context("Couldn't get vehicle type")?
                            .as_ref()
                            .to_ascii_lowercase()
                    ),
                    line.number.clone().context("Couldn't get line number")?,
                ))
            })
            .collect::<Result<_>>()?;

        let response = HTTP_CLIENT
            .post(API_URL)
            .form(&form_data)
            .send()
            .await?
            .json::<Vec<MpkWebApiResponse>>()
            .await?;

        Ok(response
            .into_iter()
            .map(|item| -> Result<VehicleLocation> {
                Ok(VehicleLocation {
                    fleet_number: None,
                    plate_number: None,
                    line: Line {
                        number: Some(item.name),
                        direction: None,
                        brigade: None,
                        vehicle_type: Some(item.vehicle_type),
                    },
                    course_id: Some(item.course),
                    delay: None,
                    current_stop: None,
                    next_stop: None,
                    position: Point::new(item.lat, item.lng),
                    direction: None,
                    updated_at: None,
                })
            })
            .collect::<Result<Vec<VehicleLocation>>>()?
            .into_iter()
            .filter(|x| Wroclaw::sanitize_coordinates(&x.position))
            .collect())
    }
}
