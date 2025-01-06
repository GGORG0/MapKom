import GlyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';
import type { Props as OriginalProps } from 'react-native-paper/src/components/Icon';

export type MaterialCommunityIcon = keyof typeof GlyphMap;
export default MaterialCommunityIcon;

export interface Props extends Omit<OriginalProps, 'source'> {
  source: MaterialCommunityIcon;
}

declare module 'react-native-paper/src/components/Icon' {
  export type Props = Props;

  export default function Icon(props: Props): JSX.Element;
}

declare module 'react-native-paper' {
  export type IconProps = Props;

  export function Icon(props: IconProps): JSX.Element;
}
