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

  // const [, setLocation] = useState<MapLibreGL.Location>();
  const [followUserLocation, setFollowUserLocation] = useState(false);

  const [followZoom, setFollowZoom] = useState(false);
  useEffect(() => {
    // TODO: fix bug where you have to press the button twice at first
    if (followUserLocation) setFollowZoom(true);
  }, [followUserLocation]);

  return (
    <Surface style={styles.screen}>
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
          followZoomLevel={followZoom ? 16 : 12}
          onUserTrackingModeChange={(event) => {
            console.log(event.nativeEvent.payload);
            setFollowUserLocation(event.nativeEvent.payload.followUserLocation);
          }}
        />
        {locationPermissionStatus?.granted && (
          <>
            <MapLibreGL.UserLocation
              animated
              showsUserHeadingIndicator
              androidRenderMode="compass"
              renderMode="native"
              // onUpdate={setLocation}
            />
          </>
        )}
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
            if (!locationPermissionStatus?.granted) requestPermission();
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
