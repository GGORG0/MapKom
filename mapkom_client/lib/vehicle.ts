import { Point } from './geometry';

export interface VehicleLocation {
    fleet_number?: number;
    plate_number?: string;
    line: {
        number?: string;
        direction?: string;
        brigade?: number;
        vehicle_type?: VehicleType;
    };

    course_id?: number;
    delay?: number;

    current_stop?: number;
    next_stop?: number;

    position: Point;

    direction?: number;

    updated_at?: string;
}

type VehicleType = 'TRAM' | 'BUS';
