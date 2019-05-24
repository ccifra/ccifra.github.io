"use strict";
//****************************************
// Text Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NITypes = window.NITypes;
    const _textAlignmentEnum = Object.freeze({
        LEFT: 'left',
        CENTER: 'center',
        RIGHT: 'right',
        JUSTIFY: 'justify'
    });
    class TextModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.STRING;
            this._text = '';
            this._textAlignment = TextModel.TextAlignmentEnum.LEFT;
        }
        static get TextAlignmentEnum() {
            return _textAlignmentEnum;
        }
        static get TEXT_G_PROPERTY_NAME() {
            return "Text";
        }
        static get MODEL_KIND() {
            return 'niText';
        }
        get text() {
            return this._text;
        }
        set text(value) {
            this._text = value;
            this.notifyModelPropertyChanged('text');
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'text';
        }
    }
    NationalInstruments.HtmlVI.Models.TextModel = TextModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.TextModel);
}());
//# sourceMappingURL=niTextModel.js.map