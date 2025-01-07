import { registerSheet } from 'react-native-actions-sheet';
import ExampleSheet, {
    definition as ExampleSheetDefinition,
} from './ExampleSheet';
import ErrorSheet, { definition as ErrorSheetDefinition } from './ErrorSheet';

registerSheet('example-sheet', ExampleSheet);
registerSheet('error-sheet', ErrorSheet);

declare module 'react-native-actions-sheet' {
    interface Sheets {
        'example-sheet': ExampleSheetDefinition;
        'error-sheet': ErrorSheetDefinition;
    }
}

export {};
