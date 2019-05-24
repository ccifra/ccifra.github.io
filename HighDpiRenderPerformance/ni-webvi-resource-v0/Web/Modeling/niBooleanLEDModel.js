"use strict";
//****************************************
// Boolean LED Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const _shapeEnum = Object.freeze({
        ROUND: 'round',
        SQUARE: 'square'
    });
    class BooleanLEDModel extends NationalInstruments.HtmlVI.Models.BooleanContentControlModel {
        constructor(id) {
            super(id);
            this._shape = BooleanLEDModel.ShapeEnum.ROUND;
            this._trueBackground = '';
            this._trueForeground = '';
            this._falseBackground = '';
            this._falseForeground = '';
        }
        static get MODEL_KIND() {
            return 'niBooleanLED';
        }
        static get ShapeEnum() {
            return _shapeEnum;
        }
        get shape() {
            return this._shape;
        }
        set shape(value) {
            this._shape = value;
            this.notifyModelPropertyChanged('shape');
        }
        get trueBackground() {
            return this._trueBackground;
        }
        set trueBackground(value) {
            this._trueBackground = value;
            this.notifyModelPropertyChanged('trueBackground');
        }
        get trueForeground() {
            return this._trueForeground;
        }
        set trueForeground(value) {
            this._trueForeground = value;
            this.notifyModelPropertyChanged('trueForeground');
        }
        get falseBackground() {
            return this._falseBackground;
        }
        set falseBackground(value) {
            this._falseBackground = value;
            this.notifyModelPropertyChanged('falseBackground');
        }
        get falseForeground() {
            return this._falseForeground;
        }
        set falseForeground(value) {
            this._falseForeground = value;
            this.notifyModelPropertyChanged('falseForeground');
        }
    }
    NationalInstruments.HtmlVI.Models.BooleanLEDModel = BooleanLEDModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.BooleanLEDModel);
}());
//# sourceMappingURL=niBooleanLEDModel.js.map