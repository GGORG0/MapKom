import type { SymbolLayerStyle as NativeStyle } from '@maplibre/maplibre-react-native';
import type { SymbolLayerSpecification as WebStyle } from 'maplibre-gl';

const markerStyle: NativeStyle = {
    iconAllowOverlap: true,
    iconIgnorePlacement: true,

    iconPitchAlignment: 'map',
    iconRotationAlignment: 'map',
};

const nativeMarkerStyles: Record<string, NativeStyle> = {
    bigMarker: {
        ...markerStyle,

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
        ...markerStyle,

        iconSize: 0.04,
    },
};

export const nativeMarkerIconStyles: Record<
    string,
    (icon: string) => NativeStyle
> = {
    bigMarker: (icon: string) => ({
        ...nativeMarkerStyles.bigMarker,
        iconImage: icon,
    }),
    smallMarker: (icon: string) => ({
        ...nativeMarkerStyles.smallMarker,
        iconImage: icon,
    }),
};

const webMarkerStyle: Partial<WebStyle> = {
    layout: {
        'icon-allow-overlap': markerStyle.iconAllowOverlap as any,
        'icon-ignore-placement': markerStyle.iconIgnorePlacement as any,

        'icon-overlap': 'always',

        'icon-pitch-alignment': markerStyle.iconPitchAlignment as any,
        'icon-rotation-alignment': markerStyle.iconRotationAlignment as any,
    },
};

const webMarkerStyles: Record<string, Partial<WebStyle>> = {
    bigMarker: {
        ...webMarkerStyle,
        layout: {
            ...webMarkerStyle.layout,
            'icon-size': nativeMarkerStyles.bigMarker.iconSize as any,
            'icon-rotate': nativeMarkerStyles.bigMarker.iconRotate as any,

            'text-field': nativeMarkerStyles.bigMarker.textField as any,
            'text-font': nativeMarkerStyles.bigMarker.textFont as any,
            'text-size': nativeMarkerStyles.bigMarker.textSize as any,

            'text-allow-overlap': nativeMarkerStyles.bigMarker
                .textAllowOverlap as any,
            'text-ignore-placement': nativeMarkerStyles.bigMarker
                .textIgnorePlacement as any,

            'text-overlap': 'always',
        },
        paint: {
            ...webMarkerStyle.paint,
            'text-color': nativeMarkerStyles.bigMarker.textColor as any,
        },
    },
    smallMarker: {
        ...webMarkerStyle,
        layout: {
            ...webMarkerStyle.layout,
            'icon-size': nativeMarkerStyles.smallMarker.iconSize as any,
        },
    },
};

export const webMarkerIconStyles: Record<
    string,
    (icon: string) => Partial<WebStyle>
> = {
    bigMarker: (icon: string) => ({
        ...webMarkerStyles.bigMarker,
        layout: {
            ...webMarkerStyles.bigMarker.layout,
            'icon-image': icon,
        },
    }),
    smallMarker: (icon: string) => ({
        ...webMarkerStyles.smallMarker,
        layout: {
            ...webMarkerStyles.smallMarker.layout,
            'icon-image': icon,
        },
    }),
};
