pub mod wroclaw;

use axum::body::Bytes;
use chrono::{DateTime, TimeZone, Utc};
use color_eyre::{
    Result,
    eyre::{Context as _, ContextCompat as _},
};
use deunicode::deunicode;
use serde::{Deserialize, Deserializer, Serialize};
use socketioxide::SocketIo;
use std::{collections::HashMap, io::Cursor, str::FromStr, sync::Arc};
use strum::{AsRefStr, EnumIter, EnumString};
use tokio::sync::RwLock;
use tokio_cron_scheduler::Job;
use tracing::{instrument, warn};
use zip::ZipArchive;

use crate::{
    HTTP_CLIENT,
    geometry::{area::Area, point::Point},
};

pub(crate) trait City {
    async fn new() -> Result<(Arc<RwLock<Self>>, impl Fn(SocketIo) -> Vec<Job>)>
    where
        Self: Sized;

    fn name() -> &'static str;
    fn name_self(&self) -> &'static str {
        Self::name()
    }

    fn slug() -> String {
        deunicode(Self::name()).to_lowercase().replace(" ", "_")
    }
    fn slug_self(&self) -> String {
        Self::slug()
    }

    fn area() -> Area;
    fn sanitize_coordinates(point: &Point) -> bool {
        Self::area().contains(point)
    }

    fn vehicle_locations(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>);

    fn vehicle_type(fleet_number: u32) -> VehicleType;
}

// TODO: I don't have time to figure out why dyn City doesn't work here ;)
// pub type CityMap = Arc<HashMap<String, Arc<RwLock<dyn City>>>>;
pub type CityMap = Arc<HashMap<String, Arc<RwLock<wroclaw::Wroclaw>>>>;

#[derive(Serialize, Debug, EnumIter, AsRefStr, EnumString, Clone)]
#[serde(rename_all = "UPPERCASE")]
#[strum(ascii_case_insensitive)]
pub enum VehicleType {
    Tram,
    Bus,
}

impl<'de> Deserialize<'de> for VehicleType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s: String = Deserialize::deserialize(deserializer)?;
        Self::from_str(&s).map_err(serde::de::Error::custom)
    }
}

#[derive(Debug, Default, Serialize, Clone)]
pub struct Line {
    pub number: Option<String>,
    pub direction: Option<String>,
    pub brigade: Option<i8>,
    pub vehicle_type: Option<VehicleType>,
}

#[derive(Debug, Default, Serialize, Clone)]
pub struct VehicleLocation {
    pub fleet_number: Option<u32>,
    pub plate_number: Option<String>,
    pub line: Line,

    pub course_id: Option<u64>,
    pub delay: Option<i64>,

    pub current_stop: Option<u32>,
    pub next_stop: Option<u32>,

    pub position: Point,

    pub direction: Option<u16>,

    pub updated_at: Option<DateTime<Utc>>,
}

pub(crate) trait LocationSource {
    async fn new() -> Result<Self>
    where
        Self: Sized;

    async fn refresh(&mut self) -> Result<DateTime<Utc>>;
    fn query(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>);
    fn query_all(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>);
}

pub trait GtfsFile: for<'de> Deserialize<'de> + serde::de::DeserializeOwned {
    fn name() -> &'static str;

    #[instrument(name = "gtfs_parse", skip(archive), fields(file = Self::name()))]
    fn new(archive: &mut zip::ZipArchive<Cursor<Bytes>>) -> Result<Vec<Self>>
    where
        Self: Sized,
        for<'de> Self: Deserialize<'de>,
    {
        let file = archive.by_name(Self::name())?;

        csv::Reader::from_reader(file)
            .deserialize()
            .map(
                |record: std::result::Result<Self, csv::Error>| -> Result<Self> {
                    record.context(format!("Failed to parse GTFS file {}", Self::name()))
                },
            )
            .collect()
    }
}

pub(crate) trait GtfsArchive<T: City>:
    Serialize + for<'de> Deserialize<'de> + serde::de::DeserializeOwned
{
    async fn new() -> Result<Self>
    where
        Self: Sized;

    fn url() -> &'static str;

    #[instrument(name = "gtfs_download")]
    async fn download() -> Result<ZipArchive<Cursor<Bytes>>> {
        let response = HTTP_CLIENT.get(Self::url()).send().await?;

        let data = response.bytes().await?;
        Ok(zip::ZipArchive::new(Cursor::new(data))?)
    }

    async fn needs_update(last_updated: DateTime<Utc>) -> Result<bool>;
    fn last_updated(&self) -> DateTime<Utc>;

    #[instrument(name = "gtfs_save_cache", skip(self))]
    async fn save_cache(&self) -> Result<()> {
        let cache_dir = std::env::var("MAPKOM_CACHE_DIR").unwrap_or_else(|_| "cache".to_string());
        let cache_dir = std::path::Path::new(&cache_dir);

        if !cache_dir.exists() {
            async_fs::create_dir_all(cache_dir).await?;
        }

        let filename = cache_dir.join(format!("gtfs_{}.bin", T::slug()));
        async_fs::write(filename, bincode::serialize(self)?).await?;

        let filename_meta = cache_dir.join(format!("gtfs_{}.txt", T::slug()));
        async_fs::write(filename_meta, self.last_updated().timestamp().to_string()).await?;

        Ok(())
    }

    #[instrument(name = "gtfs_load_cache")]
    async fn load_cache() -> Result<Self> {
        let cache_dir = std::env::var("MAPKOM_CACHE_DIR").unwrap_or_else(|_| "cache".to_string());
        let cache_dir = std::path::Path::new(&cache_dir);

        let timestamp_filename = cache_dir.join(format!("gtfs_{}.txt", T::slug()));

        if !timestamp_filename.exists() {
            warn!(
                "GTFS cache file for {} not found, downloading fresh data",
                T::name()
            );
            return Self::new().await;
        }

        let last_updated = {
            let data = async_fs::read_to_string(timestamp_filename).await?;

            Utc.timestamp_opt(data.parse()?, 0)
                .single()
                .context("Failed to parse last updated time")?
        };

        if Self::needs_update(last_updated).await? {
            warn!(
                "GTFS cache for {} is outdated, downloading fresh data",
                T::name()
            );
            return Self::new().await;
        }

        Ok({
            let filename = cache_dir.join(format!("gtfs_{}.bin", T::slug()));
            let data = async_fs::read(filename).await?;

            bincode::deserialize(&data).inspect_err(|x| {
                dbg!(x);
            })?
        })
    }
}
