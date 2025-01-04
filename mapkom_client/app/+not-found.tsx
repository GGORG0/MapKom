import { Link, Stack } from 'expo-router';
import React from 'react';
import { Button, Surface, Text } from 'react-native-paper';
import { styles } from '@/lib/styles';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <Surface style={styles.screen}>
      <Stack.Screen options={{ title: t('notFoundPage.title') }} />

      <Text variant="displayLarge">{t('notFoundPage.title')}</Text>

      <Link href="/" asChild>
        <Button icon="home" mode="contained">
          {t('notFoundPage.goHome')}
        </Button>
      </Link>
    </Surface>
  );
}
