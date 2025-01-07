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
                onPress={async () => {
                    console.log(
                        await SheetManager.show('text-input-sheet', {
                            payload: {
                                title: 'Hi',
                                fields: [
                                    {
                                        label: 'Name',
                                        placeholder: 'John Doe',
                                        initialValue: '',
                                    },
                                    {
                                        label: 'Email',
                                        placeholder: 'john@doe.com',
                                        initialValue: '',
                                    },
                                    {
                                        label: 'Password',
                                        placeholder: '********',
                                        initialValue: '',
                                        password: true,
                                        validator: (value) => value.length > 6,
                                    },
                                ],
                            },
                        }),
                    );
                }}>
                Show input sheet
            </Button>
            <Button
                mode="contained"
                onPress={async () => {
                    console.log(
                        await SheetManager.show('confirmation-sheet', {
                            payload: {
                                title: 'Hi',
                            },
                        }),
                    );
                }}>
                Show confirmation sheet
            </Button>
        </Surface>
    );
}
