import React, { useCallback } from 'react';
import { createContext, useContext, useState } from 'react';
import { View } from 'react-native';
import { Snackbar } from 'react-native-paper';

interface ShowSnackbarToastProps {
    message: string;
    duration?: number;
    actionButton?: {
        label: string;
        onPress: () => void;
    };
    showCloseIcon?: boolean;
    key?: string;
}

export const SnackbarToastContext = createContext<
    (props: ShowSnackbarToastProps) => void
>(() => {});

interface SnackbarToastProviderProps {
    children: React.ReactNode;
}

export function SnackbarToastProvider({
    children,
}: SnackbarToastProviderProps) {
    const [toasts, setToasts] = useState<ShowSnackbarToastProps[]>([]);

    const fn = useCallback((props: ShowSnackbarToastProps) => {
        console.log('showing toast', props);
        props.key = props.key || Math.random().toString();
        setToasts((prev) => [...prev, props]);
    }, []);

    return (
        <SnackbarToastContext.Provider value={fn}>
            {children}
            <View>
                {toasts.map((toast) => (
                    <Snackbar
                        visible
                        key={toast.key}
                        duration={toast.duration || 5000}
                        onDismiss={() =>
                            setToasts((prev) =>
                                prev.filter((item) => item.key !== toast.key),
                            )
                        }
                        action={
                            toast.actionButton && {
                                label: toast.actionButton.label,
                                onPress: () => {
                                    toast.actionButton &&
                                        toast.actionButton.onPress();
                                    setToasts((prev) =>
                                        prev.filter(
                                            (item) => item.key !== toast.key,
                                        ),
                                    );
                                },
                            }
                        }
                        onIconPress={
                            toast.showCloseIcon
                                ? () => {
                                      setToasts((prev) =>
                                          prev.filter(
                                              (item) => item.key !== toast.key,
                                          ),
                                      );
                                  }
                                : undefined
                        }>
                        {toast.message}
                    </Snackbar>
                ))}
            </View>
        </SnackbarToastContext.Provider>
    );
}

export function useSnackbarToast() {
    return useContext(SnackbarToastContext);
}
