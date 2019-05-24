"use strict";
//****************************************
// Boolean Button Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class BooleanButtonModel extends NationalInstruments.HtmlVI.Models.BooleanControlModel {
        constructor(id) {
            super(id);
            this._trueBackground = '';
            this._trueForeground = '';
            this._falseBackground = '';
            this._falseForeground = '';
            this._borderColor = '';
        }
        static get MODEL_KIND() {
            return 'niBooleanButton';
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
        get borderColor() {
            return this._borderColor;
        }
        set borderColor(value) {
            this._borderColor = value;
            this.notifyModelPropertyChanged('borderColor');
        }
    }
    NationalInstruments.HtmlVI.Models.BooleanButtonModel = BooleanButtonModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.BooleanButtonModel);
}());
//# sourceMappingURL=niBooleanButtonModel.js.map