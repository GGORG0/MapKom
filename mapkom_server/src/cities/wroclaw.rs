pub mod gtfs;
pub mod location_sources;

use super::{Area, City, GtfsArchive as _, VehicleLocation, VehicleType};
use crate::{
    geometry::point::Point, socketio::send_vehicle_locations::send_vehicle_locations_to_all,
};
use chrono::{DateTime, Utc};
use color_eyre::Result;
use gtfs::WroclawGtfs;
use location_sources::WroclawLocationSources;
use socketioxide::SocketIo;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio_cron_scheduler::Job;
use tracing::error;

pub struct Wroclaw {
    sources: WroclawLocationSources,
    gtfs: gtfs::WroclawGtfs,
}

impl Wroclaw {
    async fn refresh_gtfs(&mut self) -> Result<bool> {
        if gtfs::WroclawGtfs::needs_update(self.gtfs.last_updated()).await? {
            self.gtfs = WroclawGtfs::new().await?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    async fn refresh_locations(&mut self) -> Result<()> {
        self.sources.refresh().await
    }
}

impl City for Wroclaw {
    async fn new() -> Result<(Arc<RwLock<Self>>, impl Fn(SocketIo) -> Vec<Job>)>
    where
        Self: Sized,
    {
        let s = Self {
            sources: WroclawLocationSources::new().await?,
            gtfs: WroclawGtfs::load_cache().await?,
        };

        let s = Arc::new(RwLock::new(s));

        let jobs = {
            let s = s.clone();
            move |io: SocketIo| {
                vec![
                    {
                        let s = s.clone();
                        Job::new_async("every 5 seconds", move |_, _| {
                            let s = s.clone();
                            let io = io.clone();
                            Box::pin(async move {
                                let mut s = s.write().await;
                                if let Err(e) = s.refresh_locations().await {
                                    error!(error = ?e.wrap_err("Error while refreshing locations"));
                                    return;
                                }
                                send_vehicle_locations_to_all(
                                    io,
                                    Self::slug(),
                                    s.vehicle_locations(),
                                )
                                .await;
                            })
                        })
                        .expect("Failed to create location refresh job")
                    },
                    {
                        let s = s.clone();
                        Job::new_async("every 30 minutes", move |_, _| {
                            let s = s.clone();
                            Box::pin(async move {
                                let mut s = s.write().await;
                                if let Err(e) = s.refresh_gtfs().await {
                                    error!(error = ?e.wrap_err("Error while refreshing GTFS"));
                                }
                            })
                        })
                        .expect("Failed to create GTFS refresh job")
                    },
                ]
            }
        };

        Ok((s, jobs))
    }

    fn name() -> &'static str {
        "Wrocław"
    }

    fn area() -> super::Area {
        Area::new(Point::new(55.0, 14.0), Point::new(49.0, 24.0))
    }

    fn vehicle_locations(&self) -> (DateTime<Utc>, &Vec<VehicleLocation>) {
        self.sources.query()
    }

    fn vehicle_type(fleet_number: u32) -> VehicleType {
        match fleet_number {
            ..4000 => VehicleType::Tram,
            4000.. => VehicleType::Bus,
        }
    }
}
