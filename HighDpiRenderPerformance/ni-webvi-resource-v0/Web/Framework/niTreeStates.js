"use strict";
//****************************************
// NI Tree States (Enums)
// National Instruments Copyright 2019
//****************************************
(function () {
    'use strict';
    const TREE_SELECTION_MODE_ENUM = Object.freeze({
        SINGLE: 'singleRow',
        MULTIPLE: 'multipleRows',
        CUSTOM: 'custom'
    });
    class TreeStates {
        static get SelectionModeEnum() {
            return TREE_SELECTION_MODE_ENUM;
        }
    }
    NationalInstruments.HtmlVI.TreeStates = TreeStates;
})();
//# sourceMappingURL=niTreeStates.js.map