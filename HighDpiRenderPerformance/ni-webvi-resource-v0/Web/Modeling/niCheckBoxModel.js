"use strict";
//****************************************
// CheckBox Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const NITypes = window.NITypes;
    class CheckBoxModel extends NationalInstruments.HtmlVI.Models.BooleanControlModel {
        constructor(id) {
            super(id);
            this._textAlignment = 'left';
            this._trueBackground = '';
            this._falseBackground = '';
            this._textColor = '';
            this._checkMarkColor = '';
        }
        static get CHECK_MARK_COLOR_G_PROPERTY_NAME() {
            return 'CheckMarkColor';
        }
        static get MODEL_KIND() {
            return 'niCheckBox';
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
        get trueBackground() {
            return this._trueBackground;
        }
        set trueBackground(value) {
            this._trueBackground = value;
            this.notifyModelPropertyChanged('trueBackground');
        }
        get falseBackground() {
            return this._falseBackground;
        }
        set falseBackground(value) {
            this._falseBackground = value;
            this.notifyModelPropertyChanged('falseBackground');
        }
        get textColor() {
            return this._textColor;
        }
        set textColor(value) {
            this._textColor = value;
            this.notifyModelPropertyChanged('textColor');
        }
        get checkMarkColor() {
            return this._checkMarkColor;
        }
        set checkMarkColor(value) {
            this._checkMarkColor = value;
            this.notifyModelPropertyChanged('checkMarkColor');
        }
        gPropertyNIType(gPropertyName) {
            switch (gPropertyName) {
                case CheckBoxModel.CHECK_MARK_COLOR_G_PROPERTY_NAME:
                    return NITypes.UINT32;
            }
            return super.gPropertyNIType(gPropertyName);
        }
    }
    NationalInstruments.HtmlVI.Models.CheckBoxModel = CheckBoxModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.CheckBoxModel);
}());
//# sourceMappingURL=niCheckBoxModel.js.map