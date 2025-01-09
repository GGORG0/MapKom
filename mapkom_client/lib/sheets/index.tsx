import { registerSheet } from 'react-native-actions-sheet';
import ErrorSheet, { definition as ErrorSheetDefinition } from './ErrorSheet';
import TextInputSheet, {
    definition as TextInputSheetDefinition,
} from './TextInputSheet';
import ConfirmationSheet, {
    definition as ConfirmationSheetDefinition,
} from './ConfirmationSheet';
import VehicleSheet, {
    definition as VehicleSheetDefinition,
} from './VehicleSheet';

registerSheet('error-sheet', ErrorSheet);
registerSheet('text-input-sheet', TextInputSheet);
registerSheet('confirmation-sheet', ConfirmationSheet);
registerSheet('vehicle-sheet', VehicleSheet);

declare module 'react-native-actions-sheet' {
    interface Sheets {
        'error-sheet': ErrorSheetDefinition;
        'text-input-sheet': TextInputSheetDefinition;
        'confirmation-sheet': ConfirmationSheetDefinition;
        'vehicle-sheet': VehicleSheetDefinition;
    }
}

export {};
