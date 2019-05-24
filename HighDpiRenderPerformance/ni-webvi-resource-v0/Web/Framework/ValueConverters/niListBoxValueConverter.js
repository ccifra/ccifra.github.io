"use strict";
(function () {
    'use strict';
    const LISTBOX_SELECTION_ENUM = NationalInstruments.HtmlVI.NIListBox.SelectionModeEnum;
    class ListBoxValueConverter {
        static convertNIToJQXSelectionMode(selectionMode) {
            switch (selectionMode) {
                case LISTBOX_SELECTION_ENUM.ZERO_OR_ONE:
                    return 'zeroOrOne';
                case LISTBOX_SELECTION_ENUM.ONE:
                    return 'one';
                case LISTBOX_SELECTION_ENUM.ZERO_OR_MORE:
                    return 'zeroOrMany';
                case LISTBOX_SELECTION_ENUM.ONE_OR_MORE:
                    return 'oneOrMany';
            }
        }
        static convertJQXToNISelectionMode(selectionMode) {
            switch (selectionMode) {
                case 'zeroOrOne':
                    return LISTBOX_SELECTION_ENUM.ZERO_OR_ONE;
                case 'one':
                    return LISTBOX_SELECTION_ENUM.ONE;
                case 'oneOrMany':
                    return LISTBOX_SELECTION_ENUM.ONE_OR_MORE;
                case 'zeroOrMany':
                    return LISTBOX_SELECTION_ENUM.ZERO_OR_MORE;
            }
        }
        // Model -> Element
        static convert(selectedIndex, selectionMode) {
            let result = selectedIndex;
            if (!Array.isArray(selectedIndex)) {
                result = selectedIndex >= 0 ? [selectedIndex] : [];
            }
            else {
                result = selectedIndex;
            }
            return result;
        }
        // Element -> Model
        static convertBack(selectedIndex, selectionMode) {
            let result = selectedIndex;
            if ((selectionMode === LISTBOX_SELECTION_ENUM.ZERO_OR_ONE || selectionMode === LISTBOX_SELECTION_ENUM.ONE) && Array.isArray(selectedIndex)) {
                result = result.length > 0 ? result[0] : -1;
            }
            else if (!Array.isArray(selectedIndex)) {
                result = result >= 0 ? [result] : [];
            }
            return result;
        }
    }
    NationalInstruments.HtmlVI.ValueConverters.ListBoxValueConverter = ListBoxValueConverter;
}());
//# sourceMappingURL=niListBoxValueConverter.js.map