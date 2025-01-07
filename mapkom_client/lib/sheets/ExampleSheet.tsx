import { Text } from 'react-native-paper';
import MDActionSheet from './MDActionSheet';
import { SheetDefinition } from 'react-native-actions-sheet';

export default function ExampleSheet() {
    return (
        <MDActionSheet
            containerStyle={{
                minHeight: 200,
            }}>
            <Text>Hello World</Text>
        </MDActionSheet>
    );
}

export type definition = SheetDefinition;
