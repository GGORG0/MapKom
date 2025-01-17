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
use std::{future::Future, pin::Pin, sync::Arc, time::Duration};
use tokio::{
    sync::RwLock,
    task::JoinHandle,
    time::{interval, MissedTickBehavior},
};
use tracing::error;

pub struct Wroclaw {
    sources: WroclawLocationSources,
    gtfs: gtfs::WroclawGtfs,
}

impl Wroclaw {
    async fn refresh_gtfs(&mut self) -> Result<bool> {
        if self.gtfs.needs_update() {
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
    async fn new() -> Result<(Arc<RwLock<Self>>, impl Fn(SocketIo) -> Vec<JoinHandle<()>>)>
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
                #[allow(clippy::unused_unit, unreachable_code)]
                vec![
                    {
                        let s = s.clone();
                        let io = io.clone();
                        Box::pin(async move {
                            let mut timer = interval(Duration::from_secs(5));
                            timer.set_missed_tick_behavior(MissedTickBehavior::Skip);
                            loop {
                                timer.tick().await;

                                let mut s = s.write().await;
                                if let Err(e) = s.refresh_locations().await {
                                    error!(error = ?e.wrap_err("Error while refreshing locations"));
                                    continue;
                                }
                                send_vehicle_locations_to_all(
                                    io.clone(),
                                    Self::slug(),
                                    s.vehicle_locations(),
                                )
                                .await;
                            }
                            ()
                        }) as Pin<Box<dyn Future<Output = ()> + Send>>
                    },
                    {
                        let s = s.clone();
                        Box::pin(async move {
                            let mut timer = interval(Duration::from_secs(30 * 60));
                            timer.set_missed_tick_behavior(MissedTickBehavior::Skip);
                            loop {
                                timer.tick().await;

                                let mut s = s.write().await;
                                if let Err(e) = s.refresh_gtfs().await {
                                    error!(error = ?e.wrap_err("Error while refreshing GTFS"));
                                }
                            }
                            ()
                        }) as Pin<Box<dyn Future<Output = ()> + Send>>
                    },
                ]
                .into_iter()
                .map(|f| tokio::spawn(f))
                .collect()
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
