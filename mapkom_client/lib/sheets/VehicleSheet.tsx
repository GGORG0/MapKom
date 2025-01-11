// @ts-ignore
import { TimeAgo } from '@n1ru4l/react-time-ago';
import {
    Button,
    Chip,
    Icon,
    Surface,
    Text,
    useTheme,
} from 'react-native-paper';
import MDActionSheet, { styles } from './MDActionSheet';
import {
    FlatList,
    Route,
    RouteDefinition,
    SheetDefinition,
    SheetProps,
    useSheetPayload,
    useSheetRouteParams,
    useSheetRouter,
} from 'react-native-actions-sheet';
import React, {
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { VehicleLocation } from '../vehicle';
import { SheetManager } from 'react-native-actions-sheet';
import { StyleSheet, View } from 'react-native';
import { CameraRef } from '@maplibre/maplibre-react-native';
import { customColors } from '../styles';
import { useTranslation } from 'react-i18next';
import { TFunctionNonStrict } from 'i18next';
import ms from 'ms';
import { useSocketIoListener } from '../providers/SocketIoProvider';
import { Marquee } from '@animatereactnative/marquee';

function VehicleChooserSheetRoute() {
    const router = useSheetRouter('vehicle-sheet');
    const params = useSheetPayload('vehicle-sheet');

    return (
        <View style={{ ...styles.container }}>
            <FlatList
                data={params.vehicles}
                style={localStyles.chooserList}
                contentContainerStyle={localStyles.chooserContainer}
                renderItem={({ item }) => (
                    <Button
                        icon={
                            item.line.vehicle_type === 'TRAM' ? 'tram' : 'bus'
                        }
                        mode="contained"
                        buttonColor={
                            customColors[item.line.vehicle_type || 'TRAM']
                        }
                        textColor="#FFFFFF"
                        onPress={() => {
                            router?.navigate('details', { vehicle: item });
                        }}>
                        {item.line.number}
                        {!!item.line.direction && ' → ' + item.line.direction}
                        {!!item.line.number && ' /'}
                        {item.fleet_number}
                    </Button>
                )}
            />
        </View>
    );
}

function VehicleDetailsSheetRoute() {
    const { t } = useTranslation();

    const params = useSheetRouteParams('vehicle-sheet', 'details');
    const parentParams = useSheetPayload('vehicle-sheet');

    const [vehicle, setVehicle] = useState(
        () => params?.vehicle || parentParams?.vehicles[0],
    );

    useEffect(() => {
        parentParams.setSelectedMarker(
            vehicle.fleet_number
                ? `${vehicle.line.vehicle_type}-${vehicle.fleet_number}`
                : null,
        );

        let timeout: NodeJS.Timeout | null = null;

        if (vehicle) {
            parentParams.cameraRef.current?.flyTo(
                [vehicle.position.lng, vehicle.position.lat],
                1000,
            );
            timeout = setTimeout(() => {
                parentParams.cameraRef.current?.zoomTo(16, 200);
            }, 1050);
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [parentParams, vehicle]);

    const listener = useCallback(
        (_: string, vehicles: VehicleLocation[]) => {
            const newVehicle = vehicles.find(
                (v) => v.fleet_number === vehicle.fleet_number,
            );
            if (newVehicle) {
                setVehicle(newVehicle);
            }
        },
        [vehicle.fleet_number],
    );

    useSocketIoListener('vehicle_locations', listener);

    return (
        <View style={[styles.container, localStyles.sheetView]}>
            <VehicleDetailsSheetHeader vehicle={vehicle} />
            <View style={localStyles.content}>
                <Text>{t('vehicleSheet.soon')}</Text>
            </View>
        </View>
    );
}

function VehicleDetailsSheetHeader({ vehicle }: { vehicle: VehicleLocation }) {
    const { t } = useTranslation();
    const theme = useTheme();

    const date = useMemo(
        () =>
            vehicle.real_updated_at ? new Date(vehicle.real_updated_at) : null,
        [vehicle.real_updated_at],
    );

    return (
        <Surface
            elevation={2}
            style={[
                {
                    borderTopLeftRadius: 5 * theme.roundness,
                    borderTopRightRadius: 5 * theme.roundness,
                },
                localStyles.header,
            ]}>
            <Chip
                mode="flat"
                avatar={
                    <Icon
                        source={
                            (vehicle.line.vehicle_type?.toLowerCase() as
                                | 'tram'
                                | 'bus') || 'tram'
                        }
                        size={16}
                        color="#FFFFFF"
                    />
                }
                style={{
                    backgroundColor:
                        customColors[vehicle.line.vehicle_type || 'TRAM'],
                }}
                textStyle={localStyles.whiteText}>
                {vehicle.line.number}
            </Chip>
            {!!vehicle.line.direction && (
                <Marquee
                    style={localStyles.lineDirection}
                    spacing={16}
                    speed={0.5}>
                    <Text numberOfLines={1} ellipsizeMode="tail">
                        {vehicle.line.direction}
                    </Text>
                </Marquee>
            )}
            {!!date && (
                // TODO: use a better library lol
                <TimeAgo
                    formatter={formatDate(t)}
                    date={date}
                    render={({ value }: { value: string }) => (
                        <Chip
                            icon="bus-marker"
                            mode="flat"
                            style={localStyles.timerChip}>
                            {value}
                        </Chip>
                    )}
                />
            )}
        </Surface>
    );
}

const routes: Route[] = [
    {
        name: 'chooser',
        component: VehicleChooserSheetRoute,
    },
    {
        name: 'details',
        component: VehicleDetailsSheetRoute,
    },
];

export default function VehicleSheet(props: SheetProps<'vehicle-sheet'>) {
    if (!props.payload?.vehicles.length) {
        SheetManager.hide(props.sheetId);
    }

    return (
        <MDActionSheet
            // TODO: make the background interactible, requires tracking if the user un-tracks the vehicle with the camera
            // backgroundInteractionEnabled={true}
            // isModal={false}
            id={props.sheetId}
            enableRouterBackNavigation={false}
            addViewContainer={false}
            routes={routes}
            initialRoute={
                props.payload!.vehicles.length > 1 ? 'chooser' : 'details'
            }
            onClose={() => {
                props.payload?.setSelectedMarker(null);
            }}
        />
    );
}

export type definition = SheetDefinition<{
    routes: {
        chooser: RouteDefinition<{
            vehicles: VehicleLocation[];
        }>;
        details: RouteDefinition<{
            vehicle: VehicleLocation;
        }>;
    };
    payload: {
        vehicles: VehicleLocation[];
        setSelectedMarker: Dispatch<SetStateAction<string | null>>;
        cameraRef: RefObject<CameraRef>;
    };
}>;

function formatDate(t: TFunctionNonStrict<'translation', undefined>) {
    return (date: number, now: number) => {
        const d = now - date;

        let next;

        if (d < 60) {
            next = 1;
        } else if (d < 3600) {
            next = 60 - (d % 60);
        } else if (d < 86400) {
            next = 3600 - (d % 3600);
        } else {
            next = 86400 - (d % 86400);
        }

        return {
            value: t('vehicleSheet.timeFormat', {
                time: ms(d * 1000),
            }),
            next,
        };
    };
}

const localStyles = StyleSheet.create({
    chooserList: {
        width: '100%',
    },
    chooserContainer: {
        gap: 8,
    },
    sheetView: {
        padding: 0,
    },
    content: {
        padding: 12,
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        gap: 8,
    },
    whiteText: {
        color: '#FFFFFF',
    },
    lineDirection: {
        flex: 1,
    },
    timerChip: {
        marginLeft: 'auto',
    },
});
