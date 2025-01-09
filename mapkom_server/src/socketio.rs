pub mod send_vehicle_locations;

use crate::{cities::CityMap, geometry::area::Area};
use color_eyre::{Result, eyre::eyre};
use serde::Deserialize;
use socketioxide::{
    SocketIo, SocketIoBuilder,
    extract::{Data, SocketRef, State},
    handler::ConnectHandler,
    layer::SocketIoLayer,
};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, warn};

#[derive(Debug)]
pub struct SocketState {
    pub city: String,
}

pub type SocketStateWrapped = Arc<RwLock<SocketState>>;

#[derive(Deserialize)]
struct ConnectionAuth {
    city: String,
}

fn connection_middleware(
    s: SocketRef,
    Data(auth): Data<ConnectionAuth>,
    State(city_map): State<CityMap>,
) -> Result<()> {
    let sid = s.id;
    if city_map.contains_key(&auth.city) {
        let state = SocketState {
            city: auth.city.clone(),
        };
        s.extensions.insert(Arc::new(RwLock::new(state)));

        s.join(auth.city.clone())?;

        debug!("Socket {} connected with auth: {}", &sid, &auth.city);

        Ok(())
    } else {
        warn!(
            "Socket {} connected with invalid auth: {}",
            &sid, &auth.city
        );
        s.disconnect()?;
        Err(eyre!("Invalid auth"))
    }
}

async fn handle_connection() {}

pub fn init(city_map: CityMap) -> (SocketIoLayer, SocketIo) {
    let (layer, io) = SocketIoBuilder::new().with_state(city_map).build_layer();

    io.ns("/", handle_connection.with(connection_middleware));

    (layer, io)
}
