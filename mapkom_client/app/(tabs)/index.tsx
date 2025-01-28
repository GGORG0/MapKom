import { styles } from '@/lib/styles';
import { FAB, Surface } from 'react-native-paper';
import * as MapLibreNative from '@maplibre/maplibre-react-native';
import { CameraRef } from '@maplibre/maplibre-react-native';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useMemo, useRef, useState } from 'react';
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
import { useMapStyleString } from '@/lib/hooks/useMapStyle';
import useLocationMarkers from '@/lib/hooks/useLocationMarkers';
import { nativeMarkerIconStyles } from '@/lib/mapMarkerStyles';
import getMapFilters from '@/lib/mapFilters';

MapLibreNative.setAccessToken(null);
if (!__DEV__) MapLibreNative.Logger.setLogLevel('error');
else MapLibreNative.Logger.setLogLevel('warning');

export default function Index() {
    const insets = useSafeAreaInsets();
    const mapStyleString = useMapStyleString();

    // TODO: handle approximate location
    const [locationPermissionStatus, requestPermission] =
        useForegroundPermissions();
    const [followUserLocation, setFollowUserLocation] = useState(false);

    const cameraRef = useRef<CameraRef>(null);

    const markers = useLocationMarkers();
    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
    const mapFilters = useMemo(
        () => getMapFilters(selectedMarker),
        [selectedMarker],
    );

    return (
        <Surface style={styles.screen}>
            <MapLibreNative.MapView
                style={localStyles.map}
                mapStyle={mapStyleString}
                localizeLabels={false}
                pitchEnabled={false}
                logoEnabled={true}
                compassViewMargins={{
                    y: Platform.OS === 'ios' ? 0 : Math.max(insets.top, 8),
                    x: insets.right + 8,
                }}>
                <MapLibreNative.Camera
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
                        <MapLibreNative.UserLocation
                            animated
                            showsUserHeadingIndicator
                            androidRenderMode="compass"
                            renderMode="native"
                        />
                    </>
                )}

                <MapLibreNative.Images
                    images={{
                        iconTramPointer: iconTramPointer,
                        iconTramSmall: iconTramSmall,
                        iconBusPointer: iconBusPointer,
                        iconBusSmall: iconBusSmall,
                    }}
                />

                {/* TODO: animate the markers */}
                <MapLibreNative.ShapeSource
                    id="markerSource"
                    key="markerSource"
                    onPress={({ features }) => {
                        SheetManager.show('vehicle-sheet', {
                            payload: {
                                vehicles: features.map(
                                    (feature) => feature.properties?.vehicle,
                                ),
                                setSelectedMarker,
                                setPos: (pos: [number, number]) => {
                                    cameraRef.current?.flyTo(pos, 1000);

                                    const timeout = setTimeout(() => {
                                        cameraRef.current?.zoomTo(16, 200);
                                    }, 1050);

                                    return () => {
                                        clearTimeout(timeout);
                                    };
                                },
                            },
                        });
                    }}
                    hitbox={{ width: 50, height: 50 }}
                    shape={markers}
                    cluster={false}>
                    {/* TRAMS */}
                    {/* TODO: big tram markers aren't filtered correctly */}
                    <MapLibreNative.SymbolLayer
                        id="tramMarkers"
                        key="tramMarkers"
                        minZoomLevel={13}
                        style={nativeMarkerIconStyles.bigMarker(
                            'iconTramPointer',
                        )}
                        filter={mapFilters.TRAM}
                    />
                    <MapLibreNative.SymbolLayer
                        id="tramMarkersSmall"
                        key="tramMarkersSmall"
                        minZoomLevel={9}
                        maxZoomLevel={13}
                        style={nativeMarkerIconStyles.smallMarker(
                            'iconTramSmall',
                        )}
                        filter={mapFilters.TRAM}
                    />

                    {/* BUSES */}
                    <MapLibreNative.SymbolLayer
                        id="busMarkers"
                        key="busMarkers"
                        minZoomLevel={13}
                        style={nativeMarkerIconStyles.bigMarker(
                            'iconBusPointer',
                        )}
                        filter={mapFilters.BUS}
                    />
                    <MapLibreNative.SymbolLayer
                        id="busMarkersSmall"
                        key="busMarkersSmall"
                        minZoomLevel={9}
                        maxZoomLevel={13}
                        style={nativeMarkerIconStyles.smallMarker(
                            'iconBusSmall',
                        )}
                        filter={mapFilters.BUS}
                    />
                </MapLibreNative.ShapeSource>
            </MapLibreNative.MapView>

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
});
