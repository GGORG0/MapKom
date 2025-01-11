import { styles } from '@/lib/styles';
import { FAB, Surface } from 'react-native-paper';
import * as MapLibreGL from '@maplibre/maplibre-react-native';
import { CameraRef } from '@maplibre/maplibre-react-native';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useMemo, useRef, useState } from 'react';
import lightStyle from '@/lib/mapStyles/light.json';
import darkStyle from '@/lib/mapStyles/dark.json';
import { useForegroundPermissions } from 'expo-location';
import MapFabStack from '@/lib/components/MapFabStack';
import React from 'react';
import { useSocketIoListener } from '@/lib/providers/SocketIoProvider';
import { feature, featureCollection } from '@turf/helpers';
import iconTramPointer from '@/assets/images/iconTramPointer.png';
import iconTramSmall from '@/assets/images/iconTramSmall.png';
import iconBusPointer from '@/assets/images/iconBusPointer.png';
import iconBusSmall from '@/assets/images/iconBusSmall.png';
import { VehicleLocation } from '@/lib/vehicle';
import { SheetManager } from 'react-native-actions-sheet';
import {
    FormattedString,
    Value,
} from '@maplibre/maplibre-react-native/lib/typescript/commonjs/src/types/MapLibreRNStyles';

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

    const cameraRef = useRef<CameraRef>(null);

    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

    return (
        <Surface style={styles.screen}>
            {/* <Surface elevation={1} style={localStyles.debugView}>
            </Surface> */}

            <MapLibreGL.MapView
                style={localStyles.map}
                mapStyle={mapStyleString}
                localizeLabels={false}
                pitchEnabled={false}
                logoEnabled={true}
                compassViewMargins={{
                    y: Platform.OS === 'ios' ? 0 : Math.max(insets.top, 8),
                    x: insets.right + 8,
                }}>
                <MapLibreGL.Camera
                    ref={cameraRef}
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

                <MapLibreGL.Images
                    images={{
                        iconTramPointer: iconTramPointer,
                        iconTramSmall: iconTramSmall,
                        iconBusPointer: iconBusPointer,
                        iconBusSmall: iconBusSmall,
                    }}
                />

                {/* TODO: use a vector marker */}
                {/* TODO: animate the markers */}
                {/* TODO: fix markers clumping up even though i set iconAllowOverlap */}
                <MapLibreGL.ShapeSource
                    id="markerSource"
                    onPress={({ features }) => {
                        SheetManager.show('vehicle-sheet', {
                            payload: {
                                vehicles: features.map(
                                    (feature) => feature.properties?.vehicle,
                                ),
                                setSelectedMarker,
                                cameraRef,
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
                            ...markerStyles.marker,
                            ...markerStyles.bigMarker,
                            iconImage: 'iconTramPointer',
                        }}
                        filter={
                            selectedMarker
                                ? [
                                      'all',
                                      [
                                          '==',
                                          ['literal', 'TRAM'],
                                          ['get', 'vehicleType'],
                                      ],
                                      [
                                          '==',
                                          ['literal', selectedMarker],
                                          ['get', 'id'],
                                      ],
                                  ]
                                : [
                                      '==',
                                      ['literal', 'TRAM'],
                                      ['get', 'vehicleType'],
                                  ]
                        }
                    />
                    <MapLibreGL.SymbolLayer
                        id="tramMarkersSmall"
                        minZoomLevel={9}
                        maxZoomLevel={13}
                        style={{
                            ...markerStyles.marker,
                            ...markerStyles.smallMarker,
                            iconImage: 'iconTramSmall',
                        }}
                        filter={[
                            '==',
                            ['literal', 'TRAM'],
                            ['get', 'vehicleType'],
                        ]}
                    />
                    {/* BUSES */}
                    <MapLibreGL.SymbolLayer
                        id="busMarkers"
                        minZoomLevel={13}
                        style={{
                            ...markerStyles.marker,
                            ...markerStyles.bigMarker,
                            iconImage: 'iconBusPointer',
                        }}
                        filter={
                            selectedMarker
                                ? [
                                      'all',
                                      [
                                          '==',
                                          ['literal', 'BUS'],
                                          ['get', 'vehicleType'],
                                      ],
                                      [
                                          'in',
                                          ['literal', selectedMarker],
                                          ['get', 'id'],
                                      ],
                                  ]
                                : [
                                      '==',
                                      ['literal', 'BUS'],
                                      ['get', 'vehicleType'],
                                  ]
                        }
                    />
                    <MapLibreGL.SymbolLayer
                        id="busMarkersSmall"
                        minZoomLevel={9}
                        maxZoomLevel={13}
                        style={{
                            ...markerStyles.marker,
                            ...markerStyles.smallMarker,
                            iconImage: 'iconBusSmall',
                        }}
                        filter={[
                            '==',
                            ['literal', 'BUS'],
                            ['get', 'vehicleType'],
                        ]}
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

const markerStyles: Record<string, MapLibreGL.SymbolLayerStyle> = {
    marker: {
        iconAllowOverlap: true,
        iconIgnorePlacement: true,

        iconPitchAlignment: 'map',
        iconRotationAlignment: 'map',
    },
    bigMarker: {
        iconSize: 0.15,
        iconRotate: ['get', 'heading'],

        textField: ['get', 'line'],
        textFont: ['Noto Sans Regular'],
        textColor: '#fff',
        textSize: 14,

        // TODO: fix text overlap (while also not hiding overlapping markers)
        textAllowOverlap: true,
        textIgnorePlacement: true,
    },
    smallMarker: {
        iconSize: 0.04,
    },
};
