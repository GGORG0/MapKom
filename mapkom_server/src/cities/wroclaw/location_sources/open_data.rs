use crate::{
    HTTP_CLIENT,
    cities::{City, Line, LocationSource, VehicleLocation, wroclaw::Wroclaw},
    geometry::point::Point,
};
use chrono::{DateTime, NaiveDateTime, Utc};
use chrono_tz::Europe::Warsaw;
use color_eyre::{Result, eyre::ContextCompat as _};
use serde::Deserialize;
use tracing::instrument;

// Open API available at https://www.wroclaw.pl/open-data/dataset/lokalizacjapojazdowkomunikacjimiejskiejnatrasie_data

const API_URL: &str =
    "https://www.wroclaw.pl/open-data/datastore/dump/17308285-3977-42f7-81b7-fdd168c210a2";

#[derive(Deserialize, Debug)]
struct OpenDataResponse {
    #[serde(rename = "Nr_Boczny")]
    fleet_number: u32,

    #[serde(rename = "Nr_Rej")]
    plate_number: String,

    #[serde(rename = "Brygada")]
    brigade_combined: String,

    #[serde(rename = "Nazwa_Linii")]
    line: String,

    #[serde(rename = "Ostatnia_Pozycja_Szerokosc")]
    lat: f64,

    #[serde(rename = "Ostatnia_Pozycja_Dlugosc")]
    lng: f64,

    #[serde(rename = "Data_Aktualizacji")]
    updated_at: String,
}

pub struct OpenDataSource {
    cache: Vec<VehicleLocation>,
    cache_all: Vec<VehicleLocation>,
    last_updated_at: DateTime<Utc>,
}

impl LocationSource for OpenDataSource {
    async fn new() -> Result<Self>
    where
        Self: Sized,
    {
        Ok(Self {
            cache: Vec::new(),
            cache_all: Vec::new(),
            last_updated_at: DateTime::from_timestamp_nanos(0),
        })
    }

    #[instrument(name = "open_data_refresh", skip(self), level = "debug")]
    async fn refresh(&mut self) -> Result<DateTime<Utc>> {
        let (latest_updated_at, locations) = self.fetch().await?;

        self.cache = locations
            .iter()
            .filter(|x| x.updated_at.is_some())
            .filter(|x| {
                x.updated_at.expect("updated_at is None")
                    > Utc::now() - chrono::Duration::minutes(5)
            })
            .cloned()
            .collect();
        self.cache_all = locations;
        self.last_updated_at = latest_updated_at;

        Ok(self.last_updated_at)
    }

    fn query(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        (self.last_updated_at, &self.cache)
    }

    fn query_all(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        (self.last_updated_at, &self.cache_all)
    }
}

impl OpenDataSource {
    async fn fetch(&self) -> Result<(DateTime<Utc>, Vec<VehicleLocation>)> {
        let response = HTTP_CLIENT.get(API_URL).send().await?.text().await?;

        let mut reader = csv::Reader::from_reader(response.as_bytes());

        let locations: Vec<VehicleLocation> = reader
            .deserialize()
            .map(|record: std::result::Result<OpenDataResponse, csv::Error>| -> Result<VehicleLocation> {
                if Self::mpk_is_stupid(&record) {
                    return Ok(VehicleLocation::default());
                }

                let record = record?;

                Ok(VehicleLocation {
                    fleet_number: Some(record.fleet_number),

                    plate_number: match record.plate_number.as_str().trim() {
                        "None" | "" | "-" => None,
                        _ => Some(record.plate_number.trim().replace(" ", "")),
                    },

                    line: Line {
                        number: match record.line.as_str().trim() {
                            "" | "None" | "-" => None,
                            s => Some(s.to_string()),
                        },
                        direction: None,

                        brigade: match record.brigade_combined.as_str().trim() {
                            "" | "None" | "-" => None,
                            s if s.len() == 1 => s.parse().ok(),
                            s => s.chars().rev().take(2).collect::<String>().parse().ok(),
                        },
                        course_id: None,

                        vehicle_type: Some(Wroclaw::vehicle_type(record.fleet_number)),
                    },

                    position: Point::new(record.lat, record.lng),

                    heading: None,

                    updated_at: Some(NaiveDateTime::parse_from_str(&record.updated_at, "%Y-%m-%d %H:%M:%S%.6f")?
                        .and_local_timezone(Warsaw)
                        .single()
                        .context("Local timezone conversion failed")?
                        .to_utc()),
                })
            })
            .collect::<Result<Vec<VehicleLocation>>>()?
            .into_iter()
            .filter(|x| x.line.number.is_some())
            .filter(|x| x.fleet_number.is_some())
            .filter(|x| x.fleet_number.expect("fleet_number is None") >= 1000)
            .filter(|x| Wroclaw::sanitize_coordinates(&x.position))
            .collect();

        let latest_updated_at = locations
            .iter()
            .map(|loc| loc.updated_at)
            .max()
            .context("No locations")?
            .context("No updated_at")?;

        Ok((latest_updated_at, locations))
    }

    /// All of this is just to handle the stupidity of MPK Wrocław, who sometimes return "-1" as a fleet number
    fn mpk_is_stupid(record: &std::result::Result<OpenDataResponse, csv::Error>) -> bool {
        if let Err(e) = &record {
            if let csv::ErrorKind::Deserialize { pos: _, err } = e.kind() {
                if let Some(1) = err.field() {
                    if let csv::DeserializeErrorKind::ParseInt(parse_int_err) = err.kind() {
                        if let std::num::IntErrorKind::InvalidDigit = parse_int_err.kind() {
                            return true;
                        }
                    }
                }
            }
        }

        false
    }
}
