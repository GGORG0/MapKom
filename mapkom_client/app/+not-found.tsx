import { Link, usePathname } from 'expo-router';
import React from 'react';
import { Button, Surface, Text } from 'react-native-paper';
import { styles } from '@/lib/styles';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

export default function NotFoundScreen() {
    const { t } = useTranslation();
    const path = usePathname();

    return (
        <Surface style={styles.screen}>
            <Text variant="displayLarge">{t('notFoundPage.title')}</Text>

            <Text style={localStyles.pathDisplay}>{path}</Text>

            <Link href="/" asChild>
                <Button icon="home" mode="contained">
                    {t('notFoundPage.goHome')}
                </Button>
            </Link>
        </Surface>
    );
}

const localStyles = StyleSheet.create({
    pathDisplay: {
        fontFamily: 'monospace',
    },
});
