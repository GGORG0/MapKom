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
    cities::{GtfsArchive, GtfsFile},
    HTTP_CLIENT,
};
use axum::body::Bytes;
use chrono::{format::ParseErrorKind, DateTime, NaiveDate, NaiveTime, Utc};
use chrono_tz::Europe::Warsaw;
use color_eyre::{
    eyre::{eyre, format_err},
    Result,
};
use scraper::{Html, Selector};
use serde::{de, Deserialize, Deserializer, Serialize};
use std::io::Cursor;
use tracing::{info, instrument};
use zip::ZipArchive;

use super::Wroclaw;

#[derive(Serialize, Deserialize)]
pub struct WroclawGtfs {
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
    #[instrument(name = "wroclaw_gtfs_dlc_archive", skip(url), fields(name = url.rsplit_once('/').expect("Invalid URL").1))]
    async fn download_and_check_archive(url: String) -> Result<Option<ZipArchive<Cursor<Bytes>>>> {
        let response = HTTP_CLIENT.get(&url).send().await?;
        let bytes = response.bytes().await?;
        let mut archive = ZipArchive::new(Cursor::new(bytes))?;

        let services = calendar::WroclawCalendar::new(&mut archive)?;

        let now = Utc::now().with_timezone(&Warsaw).naive_local().date();

        for service in services {
            if service.start_date.0 <= now && service.end_date.0 >= now {
                info!(
                    url = &url,
                    start = service.start_date.0.format("%Y-%m-%d").to_string(),
                    end = service.end_date.0.format("%Y-%m-%d").to_string(),
                    "Found GTFS file!"
                );
                return Ok::<_, color_eyre::Report>(Some(archive));
            }
        }

        Ok(None)
    }
}

impl GtfsArchive<Wroclaw> for WroclawGtfs {
    #[instrument(name = "wroclaw_gtfs_new")]
    async fn new() -> Result<Self> {
        let mut archive = Self::download().await?;

        let s = Self {
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

    #[instrument(name = "wroclaw_gtfs_download")]
    async fn download() -> Result<ZipArchive<Cursor<Bytes>>> {
        const HISTORY_URL: &str = "https://www.wroclaw.pl/open-data/dataset/rozkladjazdytransportupublicznegoplik_data/resource_history/7d10d77f-bcf3-47b2-a608-613971c4f5f8";

        let urls = {
            let response = HTTP_CLIENT.get(HISTORY_URL).send().await?.text().await?;
            let html = Html::parse_document(response.as_str());

            let selector = Selector::parse(
                "li.resource-item > div:nth-child(1) > div:nth-child(1) > a:nth-child(2)",
            )
            .map_err(|x| format_err!("{}", x))?;

            html.select(&selector)
                .map(|element| -> Result<_> {
                    element
                        .value()
                        .attr("href")
                        .map(|x| x.to_string())
                        .ok_or_else(|| eyre!("Couldn't get link to GTFS file"))
                })
                .collect::<Result<Vec<_>>>()?
        };

        // TODO: use binary search
        for url in urls {
            if let Some(archive) = Self::download_and_check_archive(url).await? {
                return Ok(archive);
            }
        }

        Err(eyre!("Couldn't find correct GTFS file"))
    }

    fn coverage_start(&self) -> Option<DateTime<Utc>> {
        let start_date = self.calendar.iter().map(|x| x.start_date.0).min()?;

        Some(
            start_date
                .and_hms_opt(0, 0, 0)?
                .and_local_timezone(Warsaw)
                .single()?
                .with_timezone(&Utc),
        )
    }

    fn coverage_end(&self) -> Option<DateTime<Utc>> {
        let end_date = self.calendar.iter().map(|x| x.end_date.0).max()?;

        Some(
            end_date
                .and_hms_opt(23, 59, 59)?
                .and_local_timezone(Warsaw)
                .single()?
                .with_timezone(&Utc),
        )
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
