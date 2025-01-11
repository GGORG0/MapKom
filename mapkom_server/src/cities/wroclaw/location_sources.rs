pub mod impk;
pub mod mpk_web;
pub mod open_data;

use crate::cities::LocationSource as _;

use chrono::{DateTime, Utc};
use impk::ImpkApiSource;
// use mpk_web::MpkWebApiSource;
use open_data::OpenDataSource;

use color_eyre::Result;
use tracing::instrument;

use super::VehicleLocation;

pub struct WroclawLocationSources {
    pub impk: ImpkApiSource,
    // pub mpk_web: MpkWebApiSource,
    pub open_data: OpenDataSource,

    pub last_updated_at: DateTime<Utc>,
    pub locations: Vec<VehicleLocation>,
}

impl WroclawLocationSources {
    pub async fn new() -> Result<Self> {
        Ok(Self {
            impk: ImpkApiSource::new().await?,
            // mpk_web: MpkWebApiSource::new().await?,
            open_data: OpenDataSource::new().await?,

            last_updated_at: DateTime::from_timestamp_nanos(0),
            locations: Vec::new(),
        })
    }

    #[instrument(name = "wroclaw_loc_src_refresh", skip(self), level = "debug")]
    pub async fn refresh(&mut self) -> Result<()> {
        self.impk.refresh().await?;
        // self.mpk_web.refresh().await?;
        self.open_data.refresh().await?;

        self.update_cache();

        Ok(())
    }

    pub fn update_cache(&mut self) {
        let (impk_updated_at, impk_locations) = self.impk.query();
        let (open_data_updated_at, open_data_locations) = self.open_data.query();

        if impk_locations.is_empty() {
            self.locations = open_data_locations.clone();
            self.last_updated_at = open_data_updated_at;
            return;
        } else if open_data_locations.is_empty() {
            self.locations = impk_locations.clone();
            self.last_updated_at = impk_updated_at;
            return;
        }

        let updated_at = impk_updated_at.max(open_data_updated_at);

        let mut combined_locations = impk_locations.clone();
        let mut seen_fleet_numbers = std::collections::HashSet::new();

        for loc in &combined_locations {
            seen_fleet_numbers.insert(loc.fleet_number);
        }

        for loc in open_data_locations {
            if let Some(existing_loc) = combined_locations
                .iter_mut()
                .find(|l| l.fleet_number == loc.fleet_number)
            {
                if loc.updated_at > existing_loc.updated_at {
                    *existing_loc = loc.clone();
                }
            } else {
                combined_locations.push(loc.clone());
            }
        }

        self.locations = combined_locations;
        self.last_updated_at = updated_at;
    }

    pub fn query(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        (self.last_updated_at, &self.locations)
    }

    pub fn query_all(&self) -> (DateTime<Utc>, Vec<VehicleLocation>) {
        let (impk_updated_at, impk_locations) = self.impk.query();
        let (open_data_updated_at, open_data_locations) = self.open_data.query();

        let updated_at = impk_updated_at.max(open_data_updated_at);

        let combined = [&impk_locations[..], &open_data_locations[..]].concat();

        (updated_at, combined)
    }
}
