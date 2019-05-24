'use strict';
//****************************************
// NI ListBox Selection Mode
// National Instruments Copyright 2016
//****************************************
class NIListBox {
    // List Box Selection Mode
    static get SelectionModeEnum() {
        return {
            ZERO_OR_ONE: 'ZeroOrOne',
            ONE: 'One',
            ZERO_OR_MORE: 'ZeroOrMore',
            ONE_OR_MORE: 'OneOrMore'
        };
    }
}
NationalInstruments.HtmlVI.NIListBox = NIListBox;
//# sourceMappingURL=niListBoxSelectionMode.js.map