import { styles } from '@/lib/styles';
import { Surface } from 'react-native-paper';
import * as MapLibreWeb from '@vis.gl/react-maplibre';
import { ImageURISource, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import iconTramPointer from '@/assets/images/iconTramPointer.png';
import iconTramSmall from '@/assets/images/iconTramSmall.png';
import iconBusPointer from '@/assets/images/iconBusPointer.png';
import iconBusSmall from '@/assets/images/iconBusSmall.png';
import { SheetManager } from 'react-native-actions-sheet';
import useMapStyle from '@/lib/hooks/useMapStyle';
import 'maplibre-gl/dist/maplibre-gl.css';
import useLocationMarkers from '@/lib/hooks/useLocationMarkers';
import { webMarkerIconStyles } from '@/lib/mapMarkerStyles';
import getMapFilters from '@/lib/mapFilters';

export default function IndexWeb() {
    const mapStyle = useMapStyle();

    const markers = useLocationMarkers();
    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
    const mapFilters = useMemo(
        () => getMapFilters<'web'>(selectedMarker),
        [selectedMarker],
    );

    useEffect(() => {
        console.log(mapFilters);
    }, [mapFilters]);

    return (
        <Surface style={styles.screen}>
            <MapLibreWeb.Map
                mapStyle={mapStyle as MapLibreWeb.StyleSpecification}
                style={localStyles.map}
                maxPitch={0}
                attributionControl={false}>
                <MapLibreWeb.LogoControl position="bottom-left" />
                {/* TODO: use a custom FAB like in the native version */}
                <MapLibreWeb.NavigationControl position="top-right" />
                <MapLibreWeb.GeolocateControl />
                <MapLibreWeb.AttributionControl
                    position="bottom-left"
                    compact
                />

                <ImageLoader />
                <ClickHandler setSelectedMarker={setSelectedMarker} />

                <MapLibreWeb.Source
                    id="markerSource"
                    key="markerSource"
                    type="geojson"
                    data={markers}
                    cluster={false}
                    clusterRadius={0}
                    clusterMaxZoom={0}
                    clusterMinPoints={Infinity}>
                    {/* TRAMS */}
                    <MapLibreWeb.Layer
                        id="tramMarkers"
                        key="tramMarkers"
                        type="symbol"
                        minzoom={13}
                        {...webMarkerIconStyles.bigMarker('iconTramPointer')}
                        filter={mapFilters.TRAM}
                    />
                    <MapLibreWeb.Layer
                        id="tramMarkersSmall"
                        key="tramMarkersSmall"
                        type="symbol"
                        minzoom={9}
                        maxzoom={13}
                        {...webMarkerIconStyles.smallMarker('iconTramSmall')}
                        filter={mapFilters.TRAM}
                    />

                    {/* BUSES */}
                    <MapLibreWeb.Layer
                        id="busMarkers"
                        key="busMarkers"
                        type="symbol"
                        minzoom={13}
                        {...webMarkerIconStyles.bigMarker('iconBusPointer')}
                        filter={mapFilters.BUS}
                    />
                    <MapLibreWeb.Layer
                        id="busMarkersSmall"
                        key="busMarkersSmall"
                        type="symbol"
                        minzoom={9}
                        maxzoom={13}
                        {...webMarkerIconStyles.smallMarker('iconBusSmall')}
                        filter={mapFilters.BUS}
                    />
                </MapLibreWeb.Source>
            </MapLibreWeb.Map>
        </Surface>
    );
}

function ImageLoader() {
    const mapRef = MapLibreWeb.useMap();
    const map: MapLibreWeb.MapInstance | undefined = mapRef.current?.getMap();

    useEffect(() => {
        if (!map) return;
        map.on('load', () => {
            // surely "as ImageURISource" is not gonna cause any issues in the future, right?
            loadImage(
                map,
                'iconTramPointer',
                iconTramPointer as ImageURISource,
            );
            loadImage(map, 'iconTramSmall', iconTramSmall as ImageURISource);
            loadImage(map, 'iconBusPointer', iconBusPointer as ImageURISource);
            loadImage(map, 'iconBusSmall', iconBusSmall as ImageURISource);
        });
    }, [map]);

    return null;
}

async function loadImage(
    map: MapLibreWeb.MapInstance,
    id: string,
    image: ImageURISource,
) {
    if (!image.uri) return;
    const img = await map.loadImage(image.uri);
    map.addImage(id, img.data);
}

interface ClickHandlerProps {
    setSelectedMarker: React.Dispatch<React.SetStateAction<string | null>>;
}

function ClickHandler({ setSelectedMarker }: ClickHandlerProps) {
    const mapRef = MapLibreWeb.useMap();
    const map: MapLibreWeb.MapInstance | undefined = mapRef.current?.getMap();

    useEffect(() => {
        if (!map) return;
        ['bus', 'tram'].forEach((vehicle) => {
            ['', 'Small'].forEach((markerType) => {
                const layerId = `${vehicle}Markers${markerType}`;

                map.on('click', layerId, (e) => {
                    SheetManager.show('vehicle-sheet', {
                        payload: {
                            vehicles: (e.features || []).map((feature) =>
                                JSON.parse(feature.properties?.vehicle),
                            ),
                            setSelectedMarker,
                            setPos: (pos: [number, number]) => () => {
                                // TODO: idk why, but this doesn't get called immediately after opening the sheet (only on web)
                                map.flyTo({ center: pos, zoom: 16 });
                            },
                        },
                    });
                });

                map.on('mouseenter', layerId, () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', layerId, () => {
                    map.getCanvas().style.cursor = '';
                });
            });
        });
    }, [map, setSelectedMarker]);

    return null;
}

const localStyles = StyleSheet.create({
    map: {
        flex: 1,
        alignSelf: 'stretch',
    },
});
