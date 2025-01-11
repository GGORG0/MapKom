import { Point } from './geometry';

export interface VehicleLocation {
    fleet_number?: number;
    plate_number?: string;
    line: {
        number?: string;
        direction?: string;
        brigade?: number;
        course_id: number;
        vehicle_type?: VehicleType;
    };

    position: Point;
    heading?: number;

    updated_at?: string;
}

type VehicleType = 'TRAM' | 'BUS';
