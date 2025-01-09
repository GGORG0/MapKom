pub mod impk;
pub mod mpk_web;
pub mod open_data;

use crate::cities::LocationSource as _;

use chrono::{DateTime, Utc};
// use impk::ImpkApiSource;
// use mpk_web::MpkWebApiSource;
use open_data::OpenDataSource;

use color_eyre::Result;
use tracing::instrument;

use super::VehicleLocation;

// TODO: what if Open Data is down?
// somehow combine all sources

pub struct WroclawLocationSources {
    // pub impk: ImpkApiSource,
    // pub mpk_web: MpkWebApiSource,
    pub open_data: OpenDataSource,
}

impl WroclawLocationSources {
    pub async fn new() -> Result<Self> {
        Ok(Self {
            // impk: ImpkApiSource::new().await?,
            // mpk_web: MpkWebApiSource::new().await?,
            open_data: OpenDataSource::new().await?,
        })
    }

    #[instrument(name = "wroclaw_loc_src_refresh", skip(self), level = "debug")]
    pub async fn refresh(&mut self) -> Result<()> {
        // self.impk.refresh().await?;
        // self.mpk_web.refresh().await?;
        self.open_data.refresh().await?;

        Ok(())
    }

    pub fn query(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        self.open_data.query()
    }

    pub fn query_all(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        self.open_data.query_all()
    }
}
