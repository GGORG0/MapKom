import { useColorScheme } from 'react-native';
import lightStyle from '@/lib/mapStyles/light.json';
import darkStyle from '@/lib/mapStyles/dark.json';
import { useMemo } from 'react';

const mapStyles = {
    light: lightStyle,
    dark: darkStyle,
};

export default function useMapStyle() {
    const colorScheme = useColorScheme();

    const mapStyle = colorScheme
        ? mapStyles[colorScheme] || mapStyles.light
        : mapStyles.light;

    return mapStyle;
}

export function useMapStyleString() {
    const mapStyle = useMapStyle();

    const mapStyleString = useMemo(() => JSON.stringify(mapStyle), [mapStyle]);

    return mapStyleString;
}
