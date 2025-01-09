import { Button, Text } from 'react-native-paper';
import MDActionSheet, { styles } from './MDActionSheet';
import {
    FlatList,
    Route,
    RouteDefinition,
    SheetDefinition,
    SheetProps,
    useSheetPayload,
    useSheetRouteParams,
    useSheetRouter,
} from 'react-native-actions-sheet';
import React from 'react';
import { VehicleLocation } from '../vehicle';
import { SheetManager } from 'react-native-actions-sheet';
import { View } from 'react-native';

function VehicleChooserSheetRoute() {
    const router = useSheetRouter('vehicle-sheet');
    const params = useSheetPayload('vehicle-sheet');

    return (
        <View style={{ ...styles.container }}>
            <FlatList
                data={params.vehicles}
                style={{
                    width: '100%',
                }}
                contentContainerStyle={{
                    gap: 8,
                }}
                renderItem={({ item }) => (
                    <Button
                        icon={
                            item.line.vehicle_type === 'TRAM' ? 'tram' : 'bus'
                        }
                        mode="contained"
                        buttonColor={
                            item.line.vehicle_type === 'TRAM'
                                ? '#1565C0'
                                : '#2E7D32'
                        }
                        textColor="#FFFFFF"
                        onPress={() => {
                            router?.navigate('details', { vehicle: item });
                        }}>
                        {item.line.number}/{item.fleet_number}
                    </Button>
                )}
            />
        </View>
    );
}

function VehicleDetailsSheetRoute() {
    const params = useSheetRouteParams('vehicle-sheet', 'details');
    const parentParams = useSheetPayload('vehicle-sheet');

    const vehicle = params?.vehicle || parentParams?.vehicles[0];

    // TODO

    return (
        <View style={styles.container}>
            <Text>{JSON.stringify(vehicle)}</Text>
        </View>
    );
}

const routes: Route[] = [
    {
        name: 'chooser',
        component: VehicleChooserSheetRoute,
    },
    {
        name: 'details',
        component: VehicleDetailsSheetRoute,
    },
];

export default function VehicleSheet(props: SheetProps<'vehicle-sheet'>) {
    if (!props.payload?.vehicles.length) {
        SheetManager.hide(props.sheetId);
    }

    return (
        <MDActionSheet
            id={props.sheetId}
            enableRouterBackNavigation={false}
            addViewContainer={false}
            routes={routes}
            initialRoute={
                props.payload!.vehicles.length > 1 ? 'chooser' : 'details'
            }
        />
    );
}

export type definition = SheetDefinition<{
    routes: {
        chooser: RouteDefinition<{
            vehicles: VehicleLocation[];
        }>;
        details: RouteDefinition<{
            vehicle: VehicleLocation;
        }>;
    };
    payload: {
        vehicles: VehicleLocation[];
    };
}>;
