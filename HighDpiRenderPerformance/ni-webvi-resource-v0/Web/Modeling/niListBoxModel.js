"use strict";
//****************************************
// ListBox Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const SELECTION_MODE_ENUM = NationalInstruments.HtmlVI.NIListBox.SelectionModeEnum;
    const NITypes = window.NITypes;
    class ListBoxModel extends NationalInstruments.HtmlVI.Models.SelectorModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.INT32;
            this._selectionMode = SELECTION_MODE_ENUM.ONE;
            this._selectedIndexes = -1;
        }
        static get TOP_VISIBLE_ROW_G_PROPERTY_NAME() {
            return "TopVisibleRow";
        }
        static get MODEL_KIND() {
            return 'niListBox';
        }
        get selectionMode() {
            return this._selectionMode;
        }
        set selectionMode(value) {
            this._selectionMode = value;
            this.notifyModelPropertyChanged('selectionMode');
        }
        get selectedIndexes() {
            return this._selectedIndexes;
        }
        set selectedIndexes(value) {
            this._selectedIndexes = value;
            this.notifyModelPropertyChanged('selectedIndexes');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'selectedIndexes';
        }
        controlChanged(newValue) {
            const oldValue = this.selectedIndexes;
            this.selectedIndexes = newValue;
            super.controlChanged('selectedIndexes', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.ListBoxModel = ListBoxModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.ListBoxModel);
}());
//# sourceMappingURL=niListBoxModel.js.map