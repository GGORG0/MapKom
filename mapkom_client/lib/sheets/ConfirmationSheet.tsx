import { Button, Text } from 'react-native-paper';
import MDActionSheet from './MDActionSheet';
import {
    SheetDefinition,
    SheetManager,
    SheetProps,
} from 'react-native-actions-sheet';
import { StyleSheet } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ConfirmationSheet(
    props: SheetProps<'confirmation-sheet'>,
) {
    const { t } = useTranslation();

    return (
        <MDActionSheet
            id={props.sheetId}
            style={{
                gap: 12,
            }}>
            <Text variant="displaySmall" style={localStyles.text}>
                {props.payload?.title}
            </Text>

            {props.payload?.okButton !== false && (
                <Button
                    style={localStyles.button}
                    mode="contained"
                    onPress={() =>
                        SheetManager.hide(props.sheetId, { payload: true })
                    }>
                    {props.payload?.okButton || t('confirmationSheet.ok')}
                </Button>
            )}

            {props.payload?.cancelButton !== false && (
                <Button
                    style={localStyles.button}
                    mode="contained-tonal"
                    onPress={() =>
                        SheetManager.hide(props.sheetId, { payload: false })
                    }>
                    {props.payload?.cancelButton ||
                        t('confirmationSheet.cancel')}
                </Button>
            )}
        </MDActionSheet>
    );
}

export type definition = SheetDefinition<{
    payload: {
        title: string;

        // buttons are "OK" and "Cancel" by default, and disabled if set to false
        okButton?: string | false;
        cancelButton?: string | false;
    };
    returnValue: boolean;
}>;

const localStyles = StyleSheet.create({
    text: {
        textAlign: 'center',
    },
    button: {
        width: '100%',
        paddingVertical: 6,
    },
});
