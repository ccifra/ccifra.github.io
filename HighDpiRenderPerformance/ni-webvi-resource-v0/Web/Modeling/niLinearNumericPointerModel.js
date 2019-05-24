"use strict";
//****************************************
// Linear Numeric Pointer Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class LinearNumericPointerModel extends NationalInstruments.HtmlVI.Models.NumericPointerModel {
        constructor(id) {
            super(id);
            this._orientation = 'horizontal';
            this._fill = '#4386B9';
        }
        get orientation() {
            return this._orientation;
        }
        set orientation(value) {
            this._orientation = value;
            this.notifyModelPropertyChanged('orientation');
        }
        get fill() {
            return this._fill;
        }
        set fill(value) {
            this._fill = value;
            this.notifyModelPropertyChanged('fill');
        }
        sizeChanged(dimension, value) {
            this.internalControlEventOccurred('DesiredSizeChanged', { dimension: dimension, value: value });
        }
    }
    NationalInstruments.HtmlVI.Models.LinearNumericPointerModel = LinearNumericPointerModel;
}());
//# sourceMappingURL=niLinearNumericPointerModel.js.map