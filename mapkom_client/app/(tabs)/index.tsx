import { styles } from '@/lib/styles';
import { FAB, Surface } from 'react-native-paper';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import lightStyle from '@/lib/mapStyles/light.json';
import darkStyle from '@/lib/mapStyles/dark.json';
import { useForegroundPermissions } from 'expo-location';
import MapFabStack from '@/lib/components/MapFabStack';
import React from 'react';
import { useSocketIoListener } from '@/lib/providers/SocketIoProvider';
import { feature, featureCollection } from '@turf/helpers';
import tramIconSmall from '@/assets/images/tram-small.png';
import busIconSmall from '@/assets/images/bus-small.png';
import { VehicleLocation } from '@/lib/vehicle';
import { SheetManager } from 'react-native-actions-sheet';

const mapStyles = {
    light: lightStyle,
    dark: darkStyle,
};

MapLibreGL.setAccessToken(null);
if (!__DEV__) MapLibreGL.Logger.setLogLevel('error');
else MapLibreGL.Logger.setLogLevel('warning');

export default function Index() {
    // INSETS //
    const insets = useSafeAreaInsets();

    // MAP STYLE //
    const colorScheme = useColorScheme();

    const mapStyle = colorScheme
        ? mapStyles[colorScheme] || mapStyles.light
        : mapStyles.light;

    const mapStyleString = useMemo(() => JSON.stringify(mapStyle), [mapStyle]);

    // LOCATION //
    const [locationPermissionStatus, requestPermission] =
        useForegroundPermissions();
    // TODO: handle approximate location

    const [followUserLocation, setFollowUserLocation] = useState(false);

    // MARKERS //
    const [markers, setMarkers] = useState(featureCollection([]));

    // TODO: move this to the backend (maybe)
    useSocketIoListener(
        'vehicle_locations',
        (_: string, vehicles: VehicleLocation[]) => {
            const features = vehicles.map((vehicle) =>
                feature(
                    {
                        type: 'Point',
                        coordinates: [
                            vehicle.position.lng,
                            vehicle.position.lat,
                        ],
                    },
                    {
                        id: `${vehicle.line.vehicle_type}-${vehicle.fleet_number}`,
                        vehicle,
                        line: vehicle.line.number || '?',
                    },
                ),
            );

            setMarkers(featureCollection(features));
        },
    );

    return (
        <Surface style={styles.screen}>
            {/* <Surface elevation={1} style={localStyles.debugView}>
            </Surface> */}

            <MapLibreGL.MapView
                style={localStyles.map}
                styleJSON={mapStyleString}
                localizeLabels={false}
                pitchEnabled={false}
                logoEnabled={true}
                compassViewMargins={{
                    y: Platform.OS === 'ios' ? 0 : Math.max(insets.top, 8),
                    x: insets.right + 8,
                }}>
                <MapLibreGL.Camera
                    animationMode="flyTo"
                    followUserLocation={
                        locationPermissionStatus?.granted && followUserLocation
                    }
                    onUserTrackingModeChange={(event) => {
                        setFollowUserLocation(
                            event.nativeEvent.payload.followUserLocation,
                        );
                    }}
                />
                {locationPermissionStatus?.granted && (
                    <>
                        <MapLibreGL.UserLocation
                            animated
                            showsUserHeadingIndicator
                            androidRenderMode="compass"
                            renderMode="native"
                        />
                    </>
                )}

                <MapLibreGL.ShapeSource
                    id="markerSource"
                    onPress={({ features }) => {
                        SheetManager.show('vehicle-sheet', {
                            payload: {
                                vehicles: features.map(
                                    (feature) => feature.properties?.vehicle,
                                ),
                            },
                        });
                    }}
                    hitbox={{ width: 50, height: 50 }}
                    shape={markers}>
                    {/* TRAMS */}
                    <MapLibreGL.SymbolLayer
                        id="tramMarkers"
                        minZoomLevel={13}
                        style={{
                            iconImage: tramIconSmall,
                            iconAllowOverlap: true,
                            iconSize: 0.2,
                            textField: ['get', 'line'],
                            textFont: ['Noto Sans Regular'],
                            textColor: '#fff',
                        }}
                        filter={['in', ['literal', 'TRAM'], ['get', 'id']]}
                    />
                    <MapLibreGL.SymbolLayer
                        id="tramMarkersSmall"
                        minZoomLevel={10}
                        maxZoomLevel={13}
                        style={{
                            iconImage: tramIconSmall,
                            iconAllowOverlap: true,
                            iconSize: 0.05,
                        }}
                        filter={['in', ['literal', 'TRAM'], ['get', 'id']]}
                    />
                    {/* BUSES */}
                    <MapLibreGL.SymbolLayer
                        id="busMarkers"
                        minZoomLevel={13}
                        style={{
                            iconImage: busIconSmall,
                            iconAllowOverlap: true,
                            iconSize: 0.2,
                            textField: ['get', 'line'],
                            textFont: ['Noto Sans Regular'],
                            textColor: '#fff',
                        }}
                        filter={['in', ['literal', 'BUS'], ['get', 'id']]}
                    />
                    <MapLibreGL.SymbolLayer
                        id="busMarkersSmall"
                        minZoomLevel={10}
                        maxZoomLevel={13}
                        style={{
                            iconImage: busIconSmall,
                            iconAllowOverlap: true,
                            iconSize: 0.05,
                        }}
                        filter={['in', ['literal', 'BUS'], ['get', 'id']]}
                    />
                </MapLibreGL.ShapeSource>
            </MapLibreGL.MapView>

            <MapFabStack>
                <FAB
                    animated={false}
                    icon={
                        locationPermissionStatus?.granted
                            ? followUserLocation
                                ? 'crosshairs-gps'
                                : 'crosshairs'
                            : 'crosshairs-off'
                    }
                    onPress={() => {
                        if (!locationPermissionStatus?.granted)
                            requestPermission();
                        setFollowUserLocation((prev) => !prev);
                    }}
                />
            </MapFabStack>
        </Surface>
    );
}

const localStyles = StyleSheet.create({
    map: {
        flex: 1,
        alignSelf: 'stretch',
    },
    // debugView: {
    //   position: 'absolute',
    //   top: 0,
    //   left: 0,
    //   right: 0,
    //   textAlign: 'center',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   margin: 8,
    //   marginTop: 50,
    //   padding: 8,
    //   zIndex: 100,
    // },
});
