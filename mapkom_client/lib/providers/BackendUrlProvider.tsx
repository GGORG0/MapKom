import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import { registerDevMenuItems } from 'expo-dev-menu';
import { NativeModules } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { useSnackbarToast } from './SnackbarToastProvider';
import axios from 'axios';

interface BackendUrlContextData {
    url: string;
    setUrl: Dispatch<SetStateAction<string>>;

    auth: any;
    setAuth: Dispatch<SetStateAction<any>>;
}

export const BackendUrlContext = createContext<BackendUrlContextData>({
    url: '',
    setUrl: () => {},
    auth: {},
    setAuth: () => {},
});

interface BackendUrlProviderProps {
    children: React.ReactNode;
}

export function BackendUrlProvider({ children }: BackendUrlProviderProps) {
    const [url, setUrl] = useState<string>(
        (__DEV__
            ? (
                  (() => {
                      const scriptURL = NativeModules?.SourceCode?.scriptURL;
                      if (!scriptURL) return process.env.EXPO_PUBLIC_API_URL;
                      const url = new URL(scriptURL);
                      if (url.hostname.endsWith('exp.direct'))
                          return process.env.EXPO_PUBLIC_API_URL;
                      return `${url.protocol}//${url.hostname}:8080`;
                  }) as () => string
              )()
            : process.env.EXPO_PUBLIC_API_URL) ||
            'https://mapkom-api.ggorg.xyz',
    );

    // TODO: handle more than 1 city + remember the last city + detect city by location + add city selection menu
    const [auth, setAuth] = useState<any>({
        city: 'wroclaw',
    });

    const showChangeSheet = useCallback(async () => {
        await showUrlChangeSheet({ url, setUrl, auth, setAuth });
    }, [url, auth]);

    const showToast = useSnackbarToast();

    useEffect(() => {
        if (!__DEV__) return;
        console.log('Using backend URL:', url);
        showToast({
            message: `Using backend URL: ${url}`,
            duration: 5000,
            showCloseIcon: true,
            actionButton: {
                label: 'Change',
                onPress: showChangeSheet,
            },
        });
    }, [url, showChangeSheet, showToast, auth]);

    useEffect(() => {
        if (!__DEV__) return;
        registerDevMenuItems([
            {
                name: 'Change backend URL',
                callback: showChangeSheet,
            },
        ]);
    }, [auth, url, showChangeSheet]);

    return (
        <BackendUrlContext.Provider
            value={{
                url,
                setUrl,
                auth,
                setAuth,
            }}>
            {__DEV__ && <BackendFixer />}
            {children}
        </BackendUrlContext.Provider>
    );
}

export function useBackendUrl() {
    return useContext(BackendUrlContext);
}

function BackendFixer() {
    const { url, setUrl } = useBackendUrl();

    const showToast = useSnackbarToast();

    useEffect(() => {
        axios.get(url + '/health').catch((e) => {
            setUrl(
                process.env.EXPO_PUBLIC_API_URL ||
                    'https://mapkom-api.ggorg.xyz',
            );

            console.warn(`Backend URL fixed! (${e})`);

            showToast({
                message: `Backend URL fixed!`,
                duration: 1000,
                showCloseIcon: true,
            });
        });
    }, [url, setUrl, showToast]);

    return null;
}

export async function showUrlChangeSheet(ctx: BackendUrlContextData) {
    const result = await SheetManager.show('text-input-sheet', {
        payload: {
            title: 'Change backend URL',
            fields: [
                {
                    label: 'URL',
                    placeholder: 'https://mapkom-api.ggorg.xyz',
                    initialValue: ctx.url,
                },
                {
                    label: 'Auth (JSON)',
                    placeholder: '{"city":"wroclaw"}',
                    initialValue: JSON.stringify(ctx.auth),
                    validator: (value) => {
                        try {
                            JSON.parse(value);
                            return true;
                        } catch {
                            return false;
                        }
                    },
                },
            ],
        },
    });
    if (!result) return;
    ctx.setUrl(result[0] || 'https://mapkom-api.ggorg.xyz');
    ctx.setAuth(JSON.parse(result[1]) || { city: 'wroclaw' });
    // hacky, but who cares
    setTimeout(() => {
        SheetManager.hide('error-sheet');
    }, 500);
}
