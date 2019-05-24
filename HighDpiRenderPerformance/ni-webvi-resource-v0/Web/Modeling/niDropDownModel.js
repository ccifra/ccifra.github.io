"use strict";
//****************************************
// DropDown Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const NITypes = window.NITypes;
    class DropDownModel extends NationalInstruments.HtmlVI.Models.SelectorModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.INT32;
            this._selectedIndex = -1;
            this._popupEnabled = false;
            this._textAlignment = 'left';
        }
        static get MODEL_KIND() {
            return 'niDropDown';
        }
        get selectedIndex() {
            return this._selectedIndex;
        }
        set selectedIndex(value) {
            this._selectedIndex = value;
            this.notifyModelPropertyChanged('selectedIndex');
        }
        get popupEnabled() {
            return this._popupEnabled;
        }
        set popupEnabled(value) {
            this._popupEnabled = value;
            this.notifyModelPropertyChanged('popupEnabled');
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'selectedIndex';
        }
        getSelectedText() {
            return this.source[this.selectedIndex];
        }
        controlChanged(newValue) {
            const oldValue = this.selectedIndex;
            this.selectedIndex = newValue;
            super.controlChanged('selectedIndex', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.DropDownModel = DropDownModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.DropDownModel);
}());
//# sourceMappingURL=niDropDownModel.js.map