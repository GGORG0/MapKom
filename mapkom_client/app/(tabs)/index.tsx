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
  const [status, requestPermission] = useForegroundPermissions();
  // TODO: handle approximate location

  const [, setLocation] = useState<MapLibreGL.Location>();
  const [followUserLocation, setFollowUserLocation] = useState(false);

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
          followUserLocation={status?.granted && followUserLocation}
          followZoomLevel={16}
          onUserTrackingModeChange={(event) => {
            setFollowUserLocation(event.nativeEvent.payload.followUserLocation);
          }}
        />
        {status?.granted && (
          <MapLibreGL.UserLocation
            animated
            showsUserHeadingIndicator
            androidRenderMode="compass"
            renderMode="native"
            onUpdate={setLocation}
          />
        )}
      </MapLibreGL.MapView>

      <MapFabStack>
        <FAB
          animated={false}
          icon={followUserLocation ? 'crosshairs-gps' : 'crosshairs'}
          onPress={() => {
            if (!status?.granted) requestPermission();
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
