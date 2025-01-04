import { styles } from '@/lib/styles';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Surface, Text } from 'react-native-paper';

export default function Index() {
  const { t } = useTranslation();

  return (
    <Surface style={styles.screen}>
      <Text>{t('indexPage.title')}</Text>
      <Link href="/about" asChild>
        <Button mode="contained">{t('aboutPage.title')}</Button>
      </Link>
    </Surface>
  );
}
