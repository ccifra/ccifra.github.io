"use strict";
//****************************************
// Tree Value Convertor
// National Instruments Copyright 2019
//****************************************
(function () {
    'use strict';
    const TreeSelectionMode = NationalInstruments.HtmlVI.TreeStates.SelectionModeEnum;
    class TreeValueConverter {
        /**
        * Converts the TreeSelectionMode enum to the jqx equivalent value (Main difference is case).
        * @param {TreeSelectionMode} The enum to convert.
        */
        static convertNIToJQXSelectionMode(selectionMode) {
            switch (selectionMode) {
                case TreeSelectionMode.SINGLE:
                    return 'singlerow';
                case TreeSelectionMode.MULTIPLE:
                    return 'multiplerows';
                case TreeSelectionMode.CUSTOM:
                    return 'custom';
            }
        }
        /**
        * Converts the jqx selection mode string to the equivalent TreeSelectionMode enum (Main difference is case).
        * @param {string} The jqx string value to convert to an Enum.
        */
        static convertJQXToNISelectionMode(selectionMode) {
            switch (selectionMode) {
                case 'singlerow':
                    return TreeSelectionMode.SINGLE;
                case 'multiplerows':
                    return TreeSelectionMode.MULTIPLE;
                case 'custom':
                    return TreeSelectionMode.CUSTOM;
            }
        }
    }
    NationalInstruments.HtmlVI.ValueConverters.TreeValueConverter = TreeValueConverter;
}());
//# sourceMappingURL=niTreeValueConverter.js.map