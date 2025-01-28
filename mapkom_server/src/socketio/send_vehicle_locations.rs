use super::{CityMap, SocketStateWrapped};
use crate::cities::{City, VehicleLocation};
use chrono::{DateTime, Utc};
use socketioxide::{
    SocketIo,
    extract::{Extension, SocketRef, State},
};
use tracing::instrument;

#[instrument(level = "debug", skip(s, city_map))]
pub async fn send_vehicle_locations(
    s: SocketRef,
    Extension(state): Extension<SocketStateWrapped>,
    State(city_map): State<CityMap>,
) {
    let state = state.read().await;
    let city = &state.city;

    let city = city_map.get(city).expect("City not found");

    let city = city.read().await;
    let (last_updated, vehicles) = city.vehicle_locations();

    let vehicles = vehicles.iter().collect::<Vec<_>>();

    // TODO: re-add viewport tracking and filtering

    s.emit("vehicle_locations", &(last_updated, vehicles))
        .expect("Failed to send vehicle list to socket");
}

#[instrument(level = "debug", skip(io, last_updated, vehicles))]
pub async fn send_vehicle_locations_to_all(
    io: SocketIo,
    city: String,
    (last_updated, vehicles): (DateTime<Utc>, &Vec<VehicleLocation>),
) {
    io.to(city)
        .emit("vehicle_locations", &(last_updated, vehicles))
        .expect("Failed to send vehicle list to sockets");
}
