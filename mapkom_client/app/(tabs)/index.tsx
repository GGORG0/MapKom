import { styles } from '@/lib/styles';
import { Surface } from 'react-native-paper';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import lightStyle from '@/lib/mapStyles/light.json';
import darkStyle from '@/lib/mapStyles/dark.json';

const mapStyles = {
  light: lightStyle,
  dark: darkStyle,
};

MapLibreGL.setAccessToken(null);

export default function Index() {
  const insets = useSafeAreaInsets();

  // const localStyles = useMemo(
  //   () =>
  //     StyleSheet.create({
  //       map: {
  //         flex: 1,
  //         alignSelf: 'stretch',
  //         paddingTop: insets.top,
  //         paddingRight: insets.right,
  //         paddingBottom: insets.bottom,
  //         paddingLeft: insets.left,
  //       },
  //     }),
  //   [insets],
  // );

  const colorScheme = useColorScheme();

  const mapStyle = colorScheme
    ? mapStyles[colorScheme] || mapStyles.light
    : mapStyles.light;

  const mapStyleString = useMemo(() => JSON.stringify(mapStyle), [mapStyle]);

  return (
    <Surface style={styles.screen}>
      {/* @ts-ignore */}
      <MapLibreGL.MapView
        style={localStyles.map}
        styleJSON={mapStyleString}
        localizeLabels={false}
        pitchEnabled={false}
        logoEnabled={true}
        compassViewMargins={{ y: insets.top + 8, x: insets.right + 8 }}
      />
    </Surface>
  );
}

const localStyles = StyleSheet.create({
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
