"use strict";
//****************************************
// RingSelector Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class RingSelectorModel extends NationalInstruments.HtmlVI.Models.NumericValueSelectorModel {
        constructor(id) {
            super(id);
            this._allowUndefined = false;
            this._textAlignment = 'left';
            this._numericValueWidth = 40;
        }
        static get ITEMS_AND_VALUES_G_PROPERTY_NAME() {
            return 'ItemsAndValues';
        }
        static get MODEL_KIND() {
            return 'niRingSelector';
        }
        get allowUndefined() {
            return this._allowUndefined;
        }
        set allowUndefined(value) {
            this._allowUndefined = value;
            this.notifyModelPropertyChanged('allowUndefined');
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
        get numericValueWidth() {
            return this._numericValueWidth;
        }
        set numericValueWidth(value) {
            this._numericValueWidth = value;
            this.notifyModelPropertyChanged('numericValueWidth');
        }
    }
    NationalInstruments.HtmlVI.Models.RingSelectorModel = RingSelectorModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.RingSelectorModel);
}());
//# sourceMappingURL=niRingSelectorModel.js.map