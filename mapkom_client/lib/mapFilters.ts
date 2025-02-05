import type { FilterExpression as NativeExpression } from '@maplibre/maplibre-react-native/src/types/MapLibreRNStyles';
import type { ExpressionSpecification as WebExpression } from 'maplibre-gl';

type Platform = 'web' | 'native';

type MapFilter<P extends Platform> = P extends 'web'
    ? WebExpression
    : NativeExpression;

type MapFilters<P extends Platform> = {
    BUS: MapFilter<P>;
    TRAM: MapFilter<P>;
};

type VehicleTypeFilter = ['==', ['literal', string], ['get', 'vehicleType']];
function vehicleTypeFilter(vehicleType: string): VehicleTypeFilter {
    return ['==', ['literal', vehicleType], ['get', 'vehicleType']];
}

type SelectedMarkerFilter = ['==', ['literal', string], ['get', 'id']];
function selectedMarkerFilter(selectedMarker: string): SelectedMarkerFilter {
    return ['==', ['literal', selectedMarker], ['get', 'id']];
}

type CombinedFilters = ['all', VehicleTypeFilter, SelectedMarkerFilter];
function combineFilters(
    typeFilter: VehicleTypeFilter,
    selectedFilter: SelectedMarkerFilter,
): CombinedFilters {
    return ['all', typeFilter, selectedFilter];
}

export default function getMapFilters<P extends Platform>(
    selectedMarker: string | null,
): MapFilters<P> {
    if (selectedMarker) {
        return {
            BUS: combineFilters(
                vehicleTypeFilter('BUS'),
                selectedMarkerFilter(selectedMarker),
            ),
            TRAM: combineFilters(
                vehicleTypeFilter('TRAM'),
                selectedMarkerFilter(selectedMarker),
            ),
        };
    } else {
        return {
            BUS: vehicleTypeFilter('BUS'),
            TRAM: vehicleTypeFilter('TRAM'),
        };
    }
}
