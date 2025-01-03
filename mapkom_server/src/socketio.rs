pub mod send_vehicle_locations;
pub mod update_viewport;

use crate::{cities::CityMap, geometry::area::Area};
use color_eyre::{Result, eyre::eyre};
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

    pub viewport: Area,
}

pub type SocketStateWrapped = Arc<RwLock<SocketState>>;

fn connection_middleware(
    s: SocketRef,
    Data(auth): Data<String>,
    State(city_map): State<CityMap>,
) -> Result<()> {
    let sid = s.id;
    if city_map.contains_key(&auth) {
        let state = SocketState {
            city: auth.clone(),
            viewport: ((0.0, 0.0), (0.0, 0.0)).into(),
        };
        s.extensions.insert(Arc::new(RwLock::new(state)));

        s.join(auth.clone())?;

        debug!("Socket {} connected with auth: {}", &sid, &auth);

        Ok(())
    } else {
        warn!("Socket {} connected with invalid auth: {}", &sid, auth);
        s.disconnect()?;
        Err(eyre!("Invalid auth"))
    }
}

async fn handle_connection(s: SocketRef) {
    s.on("update_viewport", update_viewport::update_viewport);
}

pub fn init(city_map: CityMap) -> (SocketIoLayer, SocketIo) {
    let (layer, io) = SocketIoBuilder::new().with_state(city_map).build_layer();

    io.ns("/", handle_connection.with(connection_middleware));

    (layer, io)
}
