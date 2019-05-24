"use strict";
//****************************************
// Numeric Pointer Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class NumericPointerModel extends NationalInstruments.HtmlVI.Models.NumericControlModel {
        constructor(id) {
            super(id);
            this._scaleVisible = true;
            this._majorTicksVisible = true;
            this._minorTicksVisible = true;
            this._labelsVisible = true;
            this._coercionMode = false;
            this._rangeDivisionsMode = 'auto';
            this._mechanicalAction = 'switchWhileDragging';
        }
        static get SCALE_G_PROPERTY_NAME() {
            return 'Scale';
        }
        get scaleVisible() {
            return this._scaleVisible;
        }
        set scaleVisible(value) {
            this._scaleVisible = value;
            this.notifyModelPropertyChanged('scaleVisible');
        }
        get majorTicksVisible() {
            return this._majorTicksVisible;
        }
        set majorTicksVisible(value) {
            this._majorTicksVisible = value;
            this.notifyModelPropertyChanged('majorTicksVisible');
        }
        get minorTicksVisible() {
            return this._minorTicksVisible;
        }
        set minorTicksVisible(value) {
            this._minorTicksVisible = value;
            this.notifyModelPropertyChanged('minorTicksVisible');
        }
        get labelsVisible() {
            return this._labelsVisible;
        }
        set labelsVisible(value) {
            this._labelsVisible = value;
            this.notifyModelPropertyChanged('labelsVisible');
        }
        get coercionMode() {
            return this._coercionMode;
        }
        set coercionMode(value) {
            this._coercionMode = value;
            this.notifyModelPropertyChanged('coercionMode');
        }
        get rangeDivisionsMode() {
            return this._rangeDivisionsMode;
        }
        set rangeDivisionsMode(value) {
            this._rangeDivisionsMode = value;
            this.notifyModelPropertyChanged('rangeDivisionsMode');
        }
        get mechanicalAction() {
            return this._mechanicalAction;
        }
        set mechanicalAction(value) {
            this._mechanicalAction = value;
            this.notifyModelPropertyChanged('mechanicalAction');
        }
    }
    NationalInstruments.HtmlVI.Models.NumericPointerModel = NumericPointerModel;
}());
//# sourceMappingURL=niNumericPointerModel.js.map