import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSheetRef, SheetManager } from 'react-native-actions-sheet';
import { ActivityIndicator, Text } from 'react-native-paper';
import { io, Socket } from 'socket.io-client';
import { DisconnectDescription } from 'socket.io-client/build/esm/socket';
import { useBackendUrl } from './BackendUrlProvider';
import { useSnackbarToast } from './SnackbarToastProvider';

export const SocketIoContext = createContext<Socket | null>(null);

interface SocketIoProviderProps {
    children: React.ReactNode;
}

export function SocketIoProvider({ children }: SocketIoProviderProps) {
    const { t } = useTranslation();

    const { url, auth } = useBackendUrl();

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(url, {
            auth,
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            newSocket.removeAllListeners();
        };
    }, [url, auth]);

    const showToast = useSnackbarToast();

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
            if (__DEV__)
                showToast({
                    message: 'Connected to SocketIO',
                    duration: 1000,
                    showCloseIcon: true,
                });
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
    }, [showToast, socket, t]);

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
