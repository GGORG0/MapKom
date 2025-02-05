import GlyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';
import { ImageSourcePropType, View } from 'react-native';
import type { Props as OriginalIconProps } from 'react-native-paper/src/components/Icon';
import type { Props as OriginalButtonProps } from 'react-native-paper/src/components/Button/Button';
import type { ForwardRefComponent } from 'react-native-paper/src/utils/forwardRef';

export type MaterialCommunityIcon = keyof typeof GlyphMap;
export default MaterialCommunityIcon;

export type IconSourceBase = MaterialCommunityIcon | ImageSourcePropType;

type IconProps = {
    /**
     * Size of icon.
     */
    size: number;
    allowFontScaling?: boolean;
};

export type IconSource =
    | IconSourceBase
    | Readonly<{
          source: IconSourceBase;
          direction: 'rtl' | 'ltr' | 'auto';
      }>
    | ((props: IconProps & { color: string }) => React.ReactNode);

export type ReplaceProps<T, P extends keyof T> = Omit<T, P> & {
    [K in P]?: IconSource;
};

declare module 'react-native-paper/src/components/Icon' {
    export type IconSource = IconSource;
    export type Props = ReplaceProps<OriginalIconProps, 'source'>;

    export default function Icon(
        props: ReplaceProps<OriginalIconProps, 'source'>,
    ): React.ReactNode;
}

declare module 'react-native-paper/src/components/Button' {
    export type Props = ReplaceProps<OriginalButtonProps, 'icon'>;

    export type Button = ForwardRefComponent<
        View,
        ReplaceProps<OriginalButtonProps, 'icon'>
    >;

    export default Button;
}

declare module 'react-native-paper' {
    export type IconProps = ReplaceProps<OriginalIconProps, 'source'>;
    export type ButtonProps = ReplaceProps<OriginalButtonProps, 'icon'>;

    export function Icon(
        props: ReplaceProps<OriginalIconProps, 'source'>,
    ): React.ReactNode;
    export type Button = ForwardRefComponent<
        View,
        ReplaceProps<OriginalButtonProps, 'icon'>
    >;
}
