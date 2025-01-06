import ActionSheet, {
  ActionSheetProps,
  ActionSheetRef,
} from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MDActionSheet({
  key,
  containerStyle,
  ...props
}: ActionSheetProps & React.RefAttributes<ActionSheetRef>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ActionSheet
      containerStyle={{
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.elevation.level1,
        ...containerStyle,
      }}
      key={key}
      safeAreaInsets={insets}
      {...props}
    />
  );
}
