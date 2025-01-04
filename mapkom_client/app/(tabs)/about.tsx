import { styles } from '@/lib/styles';
import { useTranslation } from 'react-i18next';
import { Surface, Text } from 'react-native-paper';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <Surface style={styles.screen}>
      <Text>{t('aboutPage.title')}</Text>
    </Surface>
  );
}
