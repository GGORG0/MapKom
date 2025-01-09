import { StyleSheet, View, ViewStyle } from 'react-native';
import ActionSheet, {
    ActionSheetProps,
    ActionSheetRef,
} from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MDActionSheet({
    key,
    containerStyle,
    style,
    children,
    addViewContainer = true,
    ...props
}: ActionSheetProps &
    React.RefAttributes<ActionSheetRef> & {
        style?: ViewStyle;
    } & { addViewContainer?: boolean }) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <ActionSheet
            containerStyle={{
                borderTopLeftRadius: 5 * theme.roundness,
                borderTopRightRadius: 5 * theme.roundness,
                justifyContent: 'center',
                backgroundColor: theme.colors.elevation.level1,
                ...containerStyle,
            }}
            key={key}
            safeAreaInsets={insets}
            {...props}>
            {addViewContainer && (
                <View style={{ ...styles.container, ...style }}>
                    {children}
                </View>
            )}
        </ActionSheet>
    );
}

export const styles = StyleSheet.create({
    container: {
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
