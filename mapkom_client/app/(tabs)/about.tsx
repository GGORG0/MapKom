import { styles } from '@/lib/styles';
import { useTranslation } from 'react-i18next';
import { SheetManager } from 'react-native-actions-sheet';
import { Button, Surface, Text } from 'react-native-paper';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <Surface style={styles.screen}>
      <Text>{t('aboutPage.title')}</Text>
      <Button
        mode="contained"
        onPress={() => {
          SheetManager.show('example-sheet');
        }}>
        Show sheet
      </Button>
    </Surface>
  );
}
