import { Button, Icon, MD3Colors, Text } from 'react-native-paper';
import MDActionSheet from './MDActionSheet';
import {
  ActionSheetRef,
  SheetDefinition,
  SheetProps,
  useSheetRef,
} from 'react-native-actions-sheet';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import MaterialCommunityIcon from '../Icon';

export default function ErrorSheet(props: SheetProps<'error-sheet'>) {
  const { t } = useTranslation();
  const ref = useSheetRef();

  useEffect(() => {
    if (props.payload?.registerAutoClose) {
      return props.payload.registerAutoClose(ref);
    }
  }, [props.payload, ref]);

  return (
    <MDActionSheet
      id={props.sheetId}
      containerStyle={{
        minHeight: '75%',
      }}
      style={{
        gap: 8,
      }}
      disableDragBeyondMinimumSnapPoint
      closable={!props.payload?.fatal}
      gestureEnabled={!props.payload?.fatal}>
      <Icon
        source={props.payload?.icon || 'alert'}
        size={48}
        color={MD3Colors.error100}
      />

      <Text variant="displaySmall" style={localStyles.text}>
        {props.payload?.title || t('errorSheet.title')}
      </Text>

      {props.payload?.children && (
        <View style={props.payload?.childrenViewStyle}>
          {props.payload?.children}
        </View>
      )}

      <Text style={localStyles.textMonospace}>
        {props.payload?.error instanceof Error
          ? props.payload?.error.message
          : props.payload?.error}
      </Text>

      {props.payload?.details && (
        <Text style={localStyles.textMonospace}>{props.payload.details}</Text>
      )}

      {props.payload?.trigger && (
        <Text style={localStyles.text}>
          {t('errorSheet.triggeredBy')}{' '}
          <Text style={localStyles.textMonospace}>{props.payload.trigger}</Text>
        </Text>
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
    icon?: MaterialCommunityIcon;
    title?: string;

    children?: React.ReactNode;
    childrenViewStyle?: StyleProp<ViewStyle>;

    error?: Error | string;
    details?: string;

    trigger?: string;

    fatal?: boolean;

    registerAutoClose?: (
      ref: React.MutableRefObject<ActionSheetRef<never>>,
    ) => (() => void) | void;
  };
}>;

const localStyles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
  textMonospace: {
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
