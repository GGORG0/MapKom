import { styles } from '@/lib/styles';
import { FAB, Surface } from 'react-native-paper';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';
import lightStyle from '@/lib/mapStyles/light.json';
import darkStyle from '@/lib/mapStyles/dark.json';
import { useForegroundPermissions } from 'expo-location';
import MapFabStack from '@/lib/components/MapFabStack';
import React from 'react';
import { Area, Point } from '@/lib/geometry';
import { useThrottle } from '@uidotdev/usehooks';
import {
    useSocketIo,
    useSocketIoListener,
} from '@/lib/providers/SocketIoProvider';
import { feature, featureCollection } from '@turf/helpers';
import tramIcon from '@/assets/images/tram.png';
import busIcon from '@/assets/images/bus.png';

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

    const [followZoom, setFollowZoom] = useState(false);
    useEffect(() => {
        // TODO: fix bug where you have to press the button twice at first
        if (followUserLocation) setFollowZoom(true);
    }, [followUserLocation]);

    // MAP VIEWPORT //
    const socket = useSocketIo();

    const [viewport, setViewport] = useState<Area>({
        north_west: { lat: 0, lng: 0 },
        south_east: { lat: 0, lng: 0 },
    });

    const throttledViewport = useThrottle(viewport, 500);

    useEffect(() => {
        if (socket) {
            socket.emit('update_viewport', throttledViewport);
        }
    }, [throttledViewport, socket]);

    // MARKERS //
    const [tramMarkers, setTramMarkers] = useState(featureCollection([]));
    const [busMarkers, setBusMarkers] = useState(featureCollection([]));

    useSocketIoListener(
        'vehicle_locations',
        (lastUpdated: string, vehicles: VehicleLocation[]) => {
            const lastUpdatedDate = new Date(lastUpdated);

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
                    },
                ),
            );

            setTramMarkers(
                featureCollection(
                    features.filter((feature) =>
                        feature.properties.id
                            .toString()
                            .toLowerCase()
                            .startsWith('tram'),
                    ),
                ),
            );

            setBusMarkers(
                featureCollection(
                    features.filter((feature) =>
                        feature.properties.id
                            .toString()
                            .toLowerCase()
                            .startsWith('bus'),
                    ),
                ),
            );
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
                }}
                onRegionIsChanging={(feature) => {
                    const bounds = feature.properties.visibleBounds;
                    setViewport({
                        north_west: {
                            lat: bounds[0][1],
                            lng: bounds[1][0],
                        },
                        south_east: {
                            lat: bounds[1][1],
                            lng: bounds[0][0],
                        },
                    });
                }}>
                <MapLibreGL.Camera
                    animationMode="flyTo"
                    followUserLocation={
                        locationPermissionStatus?.granted && followUserLocation
                    }
                    followZoomLevel={followZoom ? 16 : 12}
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

                <MapLibreGL.Animated.ShapeSource
                    id="tramMarkerSource"
                    hitbox={{ width: 20, height: 20 }}
                    shape={tramMarkers}>
                    <MapLibreGL.Animated.SymbolLayer
                        id="tramMarkers"
                        minZoomLevel={1}
                        style={{
                            iconImage: tramIcon,
                            iconAllowOverlap: true,
                            iconSize: 0.2,
                        }}
                    />
                </MapLibreGL.Animated.ShapeSource>

                <MapLibreGL.Animated.ShapeSource
                    id="busMarkerSource"
                    hitbox={{ width: 20, height: 20 }}
                    shape={busMarkers}>
                    <MapLibreGL.Animated.SymbolLayer
                        id="busMarkers"
                        minZoomLevel={1}
                        style={{
                            iconImage: busIcon,
                            iconAllowOverlap: true,
                            iconSize: 0.2,
                        }}
                    />
                </MapLibreGL.Animated.ShapeSource>
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

interface VehicleLocation {
    fleet_number?: number;
    plate_number?: string;
    line: {
        number?: string;
        direction?: string;
        brigade?: number;
        vehicle_type?: string;
    };

    course_id?: number;
    delay?: number;

    current_stop?: number;
    next_stop?: number;

    position: Point;

    direction?: number;

    updated_at?: string;
}
