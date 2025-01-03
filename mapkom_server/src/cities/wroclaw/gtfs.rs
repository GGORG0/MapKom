pub mod agencies;
pub mod calendar;
pub mod calendar_dates;
pub mod control_stops;
pub mod feed_info;
pub mod route_types;
pub mod routes;
pub mod shapes;
pub mod stop_times;
pub mod stops;
pub mod trips;
pub mod variants;
pub mod vehicle_types;

use crate::{
    HTTP_CLIENT,
    cities::{GtfsArchive, GtfsFile},
};
use chrono::{DateTime, NaiveDate, NaiveTime, Utc, format::ParseErrorKind, serde::ts_seconds};
use color_eyre::{
    Result,
    eyre::{eyre, format_err},
};
use serde::{Deserialize, Deserializer, Serialize, de};
use tracing::{instrument, warn};

use super::Wroclaw;

#[derive(Serialize, Deserialize)]
pub struct WroclawGtfs {
    #[serde(with = "ts_seconds")]
    last_updated: DateTime<Utc>,

    pub agencies: Vec<agencies::WroclawAgency>,
    pub calendar: Vec<calendar::WroclawCalendar>,
    pub calendar_dates: Vec<calendar_dates::WroclawCalendarDate>,
    pub control_stops: Vec<control_stops::WroclawControlStop>,
    pub feed_info: Vec<feed_info::WroclawFeedInfo>,
    pub route_types: Vec<route_types::WroclawRouteType>,
    pub routes: Vec<routes::WroclawRoute>,
    pub shapes: Vec<shapes::WroclawShape>,
    pub stop_times: Vec<stop_times::WroclawStopTime>,
    pub stops: Vec<stops::WroclawStop>,
    pub trips: Vec<trips::WroclawTrip>,
    pub variants: Vec<variants::WroclawVariant>,
    pub vehicle_types: Vec<vehicle_types::WroclawVehicleType>,
}

impl WroclawGtfs {
    async fn scrape_last_updated() -> Result<DateTime<Utc>> {
        let response = HTTP_CLIENT
            .get("https://www.wroclaw.pl/open-data/dataset/rozkladjazdytransportupublicznegoplik_data")
            .send()
            .await?
            .text()
            .await?;

        let html = scraper::Html::parse_document(response.as_str());

        let selector = scraper::Selector::parse(".dataset-info-table > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2) > span:nth-child(1)")
                .map_err(|x| format_err!("{}", x))?;

        let last_updated = html
            .select(&selector)
            .next()
            .ok_or_else(|| eyre!("Couldn't find last updated date"))?
            .value()
            .attr("data-datetime")
            .ok_or_else(|| eyre!("Couldn't find last updated date"))?;

        // they use a fucked up format (rfc3339 but without the colon in the timezone)
        Ok(DateTime::parse_from_str(last_updated, "%Y-%m-%dT%H:%M:%S%z")?.to_utc())
    }
}

impl GtfsArchive<Wroclaw> for WroclawGtfs {
    #[instrument(name = "wroclaw_gtfs_new")]
    async fn new() -> Result<Self> {
        let mut archive = Self::download().await?;

        let s = Self {
            last_updated: Self::scrape_last_updated().await?,

            agencies: agencies::WroclawAgency::new(&mut archive)?,
            calendar: calendar::WroclawCalendar::new(&mut archive)?,
            calendar_dates: calendar_dates::WroclawCalendarDate::new(&mut archive)?,
            control_stops: control_stops::WroclawControlStop::new(&mut archive)?,
            feed_info: feed_info::WroclawFeedInfo::new(&mut archive)?,
            route_types: route_types::WroclawRouteType::new(&mut archive)?,
            routes: routes::WroclawRoute::new(&mut archive)?,
            shapes: shapes::WroclawShape::new(&mut archive)?,
            stop_times: stop_times::WroclawStopTime::new(&mut archive)?,
            stops: stops::WroclawStop::new(&mut archive)?,
            trips: trips::WroclawTrip::new(&mut archive)?,
            variants: variants::WroclawVariant::new(&mut archive)?,
            vehicle_types: vehicle_types::WroclawVehicleType::new(&mut archive)?,
        };

        s.save_cache().await?;

        Ok(s)
    }

    fn url() -> &'static str {
        "https://www.wroclaw.pl/open-data/87b09b32-f076-4475-8ec9-6020ed1f9ac0/OtwartyWroclaw_rozklad_jazdy_GTFS.zip"
    }

    async fn needs_update(last_updated: DateTime<Utc>) -> Result<bool> {
        let scraped = Self::scrape_last_updated().await?;
        if last_updated < scraped {
            warn!(
                last_updated = last_updated.to_rfc3339(),
                scraped = scraped.to_rfc3339(),
                message = "GTFS archive is outdated",
            );
            Ok(true)
        } else {
            Ok(false)
        }
    }

    fn last_updated(&self) -> DateTime<Utc> {
        self.last_updated
    }
}

#[derive(Debug)]
pub struct NaiveDateWrapper(pub NaiveDate);

#[derive(Debug)]
pub struct NaiveTimeWrapper(pub NaiveTime);

#[derive(Debug)]
pub struct BoolWrapper(pub bool);

impl Serialize for NaiveDateWrapper {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.0.format("%Y%m%d").to_string())
    }
}

impl<'de> Deserialize<'de> for NaiveDateWrapper {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let date = NaiveDate::parse_from_str(&s, "%Y%m%d").map_err(de::Error::custom)?;
        Ok(NaiveDateWrapper(date))
    }
}

impl Serialize for NaiveTimeWrapper {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.0.format("%H:%M:%S").to_string())
    }
}

impl<'de> Deserialize<'de> for NaiveTimeWrapper {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let time = match NaiveTime::parse_from_str(&s, "%H:%M:%S") {
            Ok(time) => time,
            Err(e) => {
                if let ParseErrorKind::OutOfRange = e.kind() {
                    let mut s = s;
                    let hour = s[0..2].parse::<u8>().map_err(de::Error::custom)?;
                    s.replace_range(0..2, &format!("{:02}", hour % 24));
                    NaiveTime::parse_from_str(&s, "%H:%M:%S").map_err(de::Error::custom)?
                } else {
                    return Err(de::Error::custom(e));
                }
            }
        };
        Ok(NaiveTimeWrapper(time))
    }
}

impl Serialize for BoolWrapper {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(if self.0 { "1" } else { "0" })
    }
}

impl<'de> Deserialize<'de> for BoolWrapper {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        let value = match s.as_str() {
            "0" => false,
            "1" => true,
            _ => return Err(de::Error::custom("expected '0' or '1'")),
        };
        Ok(BoolWrapper(value))
    }
}
