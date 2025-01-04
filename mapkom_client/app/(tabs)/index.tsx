import { styles } from '@/lib/styles';
import { Surface } from 'react-native-paper';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { StyleSheet } from 'react-native';

MapLibreGL.setAccessToken(null);

export default function Index() {
  return (
    <Surface style={styles.screen}>
      {/* @ts-ignore */}
      <MapLibreGL.MapView
        style={localStyles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
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
