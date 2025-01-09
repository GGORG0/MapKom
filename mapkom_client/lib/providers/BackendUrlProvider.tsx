import React, { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { createContext, useContext, useState } from 'react';
import { registerDevMenuItems } from 'expo-dev-menu';
import { NativeModules } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { useSnackbarToast } from './SnackbarToastProvider';

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
        __DEV__
            ? (
                  (() => {
                      const scriptURL = NativeModules?.SourceCode?.scriptURL;
                      if (!scriptURL) return process.env.EXPO_PUBLIC_API_URL;
                      const url = new URL(scriptURL);
                      return `${url.protocol}//${url.hostname}:8080`;
                  }) as () => string
              )()
            : process.env.EXPO_PUBLIC_API_URL || '',
    );

    // TODO: handle more than 1 city + remember the last city + detect city by location + add city selection menu
    const [auth, setAuth] = useState<any>({
        city: 'wroclaw',
    });

    const showChangeSheet = useCallback(async () => {
        const result = await SheetManager.show('text-input-sheet', {
            payload: {
                title: 'Change backend URL',
                fields: [
                    {
                        label: 'URL',
                        placeholder: 'https://mapkom-api.ggorg.xyz',
                        initialValue: url,
                    },
                    {
                        label: 'Auth (JSON)',
                        placeholder: '{"city":"wroclaw"}',
                        initialValue: JSON.stringify(auth),
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
        setUrl((prev) => (result ? result[0] : prev));
        setAuth((prev: any) => (result ? JSON.parse(result[1]) : prev));
        // hacky, but who cares
        setTimeout(() => {
            SheetManager.hide('error-sheet');
        }, 500);
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
            {children}
        </BackendUrlContext.Provider>
    );
}

export function useBackendUrl() {
    return useContext(BackendUrlContext);
}
