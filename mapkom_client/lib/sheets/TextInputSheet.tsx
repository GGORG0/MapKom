import { Button, Text, TextInput } from 'react-native-paper';
import MDActionSheet from './MDActionSheet';
import {
    SheetDefinition,
    SheetManager,
    SheetProps,
} from 'react-native-actions-sheet';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import React from 'react';

export default function TextInputSheet(props: SheetProps<'text-input-sheet'>) {
    const { t } = useTranslation();

    const [values, setValues] = React.useState<string[]>(
        () =>
            props.payload?.fields.map((field) => field.initialValue || '') ??
            [],
    );

    const [errors, setErrors] = React.useState<boolean[]>(
        () =>
            props.payload?.fields.map((field) =>
                field.validator
                    ? !field.validator(field.initialValue || '')
                    : false,
            ) ?? [],
    );

    // TODO: fix opening keyboard sliding the sheet up

    return (
        <MDActionSheet
            id={props.sheetId}
            style={{
                gap: 12,
            }}>
            <Text variant="displaySmall" style={localStyles.text}>
                {props.payload?.title}
            </Text>

            {props.payload?.fields.map((field, index) => (
                <TextInput
                    mode="outlined"
                    style={localStyles.input}
                    key={index}
                    label={field.label}
                    placeholder={field.placeholder}
                    secureTextEntry={field.password}
                    defaultValue={field.initialValue}
                    value={values[index]}
                    onChangeText={(text) => {
                        setValues((prev) => {
                            if (field.validator) {
                                setErrors((prevErrors) =>
                                    prevErrors.map((value, i) =>
                                        i === index
                                            ? field.validator
                                                ? !field.validator(text)
                                                : value
                                            : value,
                                    ),
                                );
                            }
                            return prev.map((value, i) =>
                                i === index ? text : value,
                            );
                        });
                    }}
                    error={errors[index]}
                />
            ))}

            <Button
                style={localStyles.button}
                mode="contained"
                disabled={errors.some((error) => error)}
                onPress={() =>
                    SheetManager.hide(props.sheetId, { payload: values })
                }>
                {t('textInputSheet.done')}
            </Button>

            {props.payload?.cancelButton !== false && (
                <Button
                    style={localStyles.button}
                    mode="contained-tonal"
                    onPress={() =>
                        SheetManager.hide(props.sheetId, { payload: undefined })
                    }>
                    {t('textInputSheet.cancel')}
                </Button>
            )}
        </MDActionSheet>
    );
}

export interface TextInputSheetItem {
    label?: string;
    password?: boolean;
    placeholder?: string;
    initialValue?: string;
    validator?: (value: string) => boolean;
}

export type definition = SheetDefinition<{
    payload: {
        title?: string;

        fields: TextInputSheetItem[];

        doneButton?: string;
        cancelButton?: string | false;
    };
    returnValue?: string[];
}>;

const localStyles = StyleSheet.create({
    text: {
        textAlign: 'center',
    },
    button: {
        width: '100%',
        paddingVertical: 6,
    },
    input: {
        width: '100%',
    },
});
