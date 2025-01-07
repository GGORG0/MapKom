import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSheetRef, SheetManager } from 'react-native-actions-sheet';
import { ActivityIndicator, Text } from 'react-native-paper';
import { io, Socket } from 'socket.io-client';
import { DisconnectDescription } from 'socket.io-client/build/esm/socket';

export const SocketIoContext = createContext<Socket | null>(null);

interface SocketIoProviderProps {
    children: React.ReactNode;
    city: string;
}

export function SocketIoProvider({ children, city }: SocketIoProviderProps) {
    const { t } = useTranslation();

    const [socket, setSocket] = useState<Socket | null>(null);

    const router = useRouter();
    const pathname = usePathname();
    const { error: pathError, errorTrigger } = useLocalSearchParams<{
        error?: string;
        errorTrigger?: string;
    }>();

    useEffect(() => {
        const newSocket = io(process.env.EXPO_PUBLIC_API_URL, {
            auth: { city },
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            newSocket.removeAllListeners();
        };
    }, [city]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        const sheetAutoCloseHandler = (
            ref: React.MutableRefObject<ActionSheetRef<never>>,
        ) => {
            const connectHandler = () => {
                ref.current?.hide();
            };
            socket.on('connect', connectHandler);

            return () => {
                socket.off('connect', connectHandler);
            };
        };

        const showSheet = (error: Error) => {
            SheetManager.show('error-sheet', {
                payload: {
                    icon: 'wifi-off',
                    title: t('socketIo.errorSheet.title'),
                    children: <ErrorSheetSpinner />,
                    childrenViewStyle: {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                    },
                    error,
                    trigger: 'socketIo',
                    fatal: true,
                    registerAutoClose: sheetAutoCloseHandler,
                },
            });
        };

        const connectHandler = () => {
            console.log('socketio connected');
        };
        socket.on('connect', connectHandler);

        const connectErrorHandler = (error: Error) => {
            console.error('socketio connect_error', error);

            showSheet(error);
        };
        socket.on('connect_error', connectErrorHandler);

        const disconnectHandler = (
            reason: Socket.DisconnectReason,
            description?: DisconnectDescription,
        ) => {
            console.log('socketio disconnected', reason, description);

            showSheet(new Error(reason));
        };
        socket.on('disconnect', disconnectHandler);

        return () => {
            socket.off('connect', connectHandler);
            socket.off('connect_error', connectErrorHandler);
            socket.off('disconnect', disconnectHandler);
        };
    }, [errorTrigger, pathError, pathname, router, socket, t]);

    return (
        <SocketIoContext.Provider value={socket}>
            {children}
        </SocketIoContext.Provider>
    );
}

export function useSocketIo() {
    return useContext(SocketIoContext);
}

export function useSocketIoListener(
    event: string,
    listener: (...args: any[]) => void,
) {
    const socket = useSocketIo();

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on(event, listener);

        return () => {
            socket.off(event, listener);
        };
    }, [event, listener, socket]);
}

function ErrorSheetSpinner() {
    const { t } = useTranslation();

    return (
        <>
            <ActivityIndicator />
            <Text>{t('socketIo.errorSheet.tryingToReconnect')}</Text>
        </>
    );
}
