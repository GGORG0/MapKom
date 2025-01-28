import { featureCollection, feature } from '@turf/helpers';
import { useState, useCallback } from 'react';
import { useSocketIoListener } from '../providers/SocketIoProvider';
import { VehicleLocation } from '../vehicle';

export default function useLocationMarkers() {
    const [markers, setMarkers] = useState(featureCollection([]));

    // TODO: move this to the backend (maybe)
    const listener = useCallback((_: string, vehicles: VehicleLocation[]) => {
        const features = vehicles.map((vehicle) =>
            feature(
                {
                    type: 'Point',
                    coordinates: [vehicle.position.lng, vehicle.position.lat],
                },
                {
                    id: `${vehicle.line.vehicle_type}-${vehicle.fleet_number}`,
                    vehicle,
                    line: vehicle.line.number,
                    vehicleType: vehicle.line.vehicle_type,
                    heading: vehicle.heading,
                },
            ),
        );

        setMarkers(featureCollection(features));
    }, []);

    useSocketIoListener('vehicle_locations', listener);

    return markers;
}
