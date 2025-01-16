import { styles } from '@/lib/styles';
import { useTranslation } from 'react-i18next';
import { Button, Surface, Text } from 'react-native-paper';
import Logo from '@/assets/logos/logo-circle.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import * as Application from 'expo-application';
import { useEffect, useState } from 'react';
import {
    showUrlChangeSheet,
    useBackendUrl,
} from '@/lib/providers/BackendUrlProvider';

export default function AboutScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [devTapCount, setDevTapCount] = useState(0);
    const urlCtx = useBackendUrl();

    useEffect(() => {
        if (devTapCount >= 10) {
            setDevTapCount(0);
            showUrlChangeSheet(urlCtx);
        }
    }, [devTapCount, urlCtx]);

    return (
        <Surface
            style={[
                styles.screen,
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
            ]}>
            <Logo width={250} height={250} />
            <Text variant="displayLarge">{t('aboutPage.title')}</Text>
            <Text>{t('aboutPage.subtitle')}</Text>
            <Text>{t('aboutPage.credits')}</Text>

            <Text
                onPress={() => {
                    setDevTapCount((prev) => prev + 1);
                }}>
                {Application.nativeApplicationVersion}
                {' ('}
                {t('aboutPage.build')} {Application.nativeBuildVersion}
                {')'}
            </Text>

            <Link href="https://github.com/GGORG0/MapKom" asChild>
                <Button icon="github" mode="contained">
                    {t('aboutPage.githubButton')}
                </Button>
            </Link>
        </Surface>
    );
}
