import { Button, Icon, MD3Colors, Text } from 'react-native-paper';
import MDActionSheet from './MDActionSheet';
import {
  SheetDefinition,
  SheetProps,
  useSheetRef,
} from 'react-native-actions-sheet';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import React from 'react';

export default function ErrorSheet(props: SheetProps<'error-sheet'>) {
  const { t } = useTranslation();
  const ref = useSheetRef();

  return (
    <MDActionSheet
      id={props.sheetId}
      containerStyle={{
        minHeight: 200,
        gap: 16,
      }}
      disableDragBeyondMinimumSnapPoint
      closable={!props.payload?.fatal}
      gestureEnabled={!props.payload?.fatal}>
      <View style={localStyles.headerContainer}>
        <Icon source="alert" size={48} color={MD3Colors.error100} />
        <Text variant="displayLarge">{t('errorSheet.title')}</Text>
      </View>

      <Text style={localStyles.textMonospace}>
        {props.payload?.error instanceof Error
          ? props.payload?.error.message
          : props.payload?.error}
      </Text>

      {props.payload?.details && (
        <Text style={localStyles.textMonospace}>{props.payload.details}</Text>
      )}

      {props.payload?.trigger && (
        <>
          <Text style={localStyles.text}>{t('errorSheet.triggeredBy')}</Text>
          <Text style={localStyles.textMonospace}>{props.payload.trigger}</Text>
        </>
      )}

      {!props.payload?.fatal && (
        <Button mode="contained" onPress={() => ref.current?.hide()}>
          {t('errorSheet.dismiss')}
        </Button>
      )}
    </MDActionSheet>
  );
}

export type definition = SheetDefinition<{
  payload: {
    error?: Error | string;
    details?: string;
    trigger?: string;
    fatal?: boolean;
  };
}>;

const localStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    color: MD3Colors.error100,
  },
  text: {
    textAlign: 'center',
  },
  textMonospace: {
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
