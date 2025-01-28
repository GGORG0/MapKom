import { Stack } from 'expo-router';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { Platform, useColorScheme } from 'react-native';
import {
    adaptNavigationTheme,
    MD3DarkTheme,
    MD3LightTheme,
    PaperProvider,
} from 'react-native-paper';
import { Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    DarkTheme as NavDarkTheme,
    DefaultTheme as NavLightTheme,
    ThemeProvider,
} from '@react-navigation/native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from '@/lib/i18n';
import { createLanguageDetector } from 'react-native-localization-settings';
import {
    SocketIoErrorHandler,
    SocketIoProvider,
} from '@/lib/providers/SocketIoProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SheetProvider } from 'react-native-actions-sheet';
import '@/lib/sheets';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import { BackendUrlProvider } from '@/lib/providers/BackendUrlProvider';
import { SnackbarToastProvider } from '@/lib/providers/SnackbarToastProvider';
import WebLanguageDetector from 'i18next-browser-languagedetector';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
    duration: 1000,
    fade: true,
});

let i18nInst = i18n;

if (Platform.OS === 'android' || Platform.OS === 'ios') {
    const languageDetector = createLanguageDetector({});
    i18nInst = i18n.use(languageDetector);
} else if (Platform.OS === 'web') {
    i18nInst = i18n.use(WebLanguageDetector);
}

i18nInst.use(initReactI18next).init({
    supportedLngs: ['en', 'en-US', 'en-GB', 'pl', 'pl-PL'],
    resources,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default function RootLayoutWrapper() {
    const [loaded, error] = useFonts({
        Inter_900Black,
        ...MaterialCommunityIcons.font,
    });

    useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return <RootLayout />;
}

function RootLayout() {
    const colorScheme = useColorScheme();
    const { theme } = useMaterial3Theme();

    const paperTheme =
        colorScheme === 'dark'
            ? { ...MD3DarkTheme, colors: theme.dark }
            : { ...MD3LightTheme, colors: theme.light };

    const { DarkTheme, LightTheme } = adaptNavigationTheme({
        reactNavigationDark: NavDarkTheme,
        reactNavigationLight: NavLightTheme,
        materialDark: MD3DarkTheme,
        materialLight: MD3LightTheme,
    });

    return (
        <SafeAreaProvider>
            <ThemeProvider
                value={
                    colorScheme === 'light'
                        ? { ...LightTheme, fonts: NavLightTheme.fonts }
                        : { ...DarkTheme, fonts: NavDarkTheme.fonts }
                }>
                <PaperProvider theme={paperTheme}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <SnackbarToastProvider>
                            <BackendUrlProvider>
                                <SocketIoProvider>
                                    <SheetProvider>
                                        <Stack
                                            screenOptions={{
                                                headerShown: false,
                                            }}>
                                            <Stack.Screen name="(tabs)" />
                                            <Stack.Screen name="+not-found" />
                                        </Stack>
                                        <SystemBars style="auto" />
                                        <SocketIoErrorHandler />
                                    </SheetProvider>
                                </SocketIoProvider>
                            </BackendUrlProvider>
                        </SnackbarToastProvider>
                    </GestureHandlerRootView>
                </PaperProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
