"use strict";
//****************************************
// NumericValueSelector Model
// National Instruments Copyright 2015
//****************************************
(function (parent) {
    'use strict';
    const NITypes = window.NITypes;
    class NumericValueSelectorModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.INT32;
            this._value = 0;
            this._items = [];
            this._popupEnabled = false;
            this._disabledIndexes = [];
        }
        static get DISABLED_INDEXES_G_PROPERTY_NAME() {
            return 'DisabledIndexes';
        }
        static get ITEMS_G_PROPERTY_NAME() {
            return 'Items';
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
            this.notifyModelPropertyChanged('value');
        }
        get items() {
            return this._items;
        }
        set items(value) {
            this._items = value;
            this.notifyModelPropertyChanged('items');
        }
        get popupEnabled() {
            return this._popupEnabled;
        }
        set popupEnabled(value) {
            this._popupEnabled = value;
            this.notifyModelPropertyChanged('popupEnabled');
        }
        get disabledIndexes() {
            return this._disabledIndexes;
        }
        set disabledIndexes(value) {
            this._disabledIndexes = value;
            this.notifyModelPropertyChanged('disabledIndexes');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'value';
        }
        controlChanged(newValue) {
            const oldValue = this.value;
            this.value = newValue;
            super.controlChanged('value', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.NumericValueSelectorModel = NumericValueSelectorModel;
}());
//# sourceMappingURL=niNumericValueSelectorModel.js.map