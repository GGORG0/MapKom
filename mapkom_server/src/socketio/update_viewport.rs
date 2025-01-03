use super::{Area, CityMap, SocketStateWrapped, send_vehicle_locations::send_vehicle_locations};
use socketioxide::extract::{Data, Extension, SocketRef, State};
use tracing::instrument;

#[instrument(level = "debug", skip(s, city_map))]
pub async fn update_viewport(
    s: SocketRef,
    Extension(state): Extension<SocketStateWrapped>,
    Data(viewport): Data<Area>,
    State(city_map): State<CityMap>,
) {
    {
        let mut state = state.write().await;
        state.viewport = viewport;
    }

    send_vehicle_locations(s, Extension(state), State(city_map)).await;
}
