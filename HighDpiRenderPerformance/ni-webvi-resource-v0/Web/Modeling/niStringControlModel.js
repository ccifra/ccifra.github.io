"use strict";
//****************************************
// String Control Model
// National Instruments Copyright 2015
//****************************************
(function (parent) {
    'use strict';
    const NITypes = window.NITypes;
    const textDisplayMode = NationalInstruments.HtmlVI.StringDisplayModeConstants.TextDisplayMode;
    class StringControlModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.STRING;
            this._text = '';
            this._acceptsReturn = false;
            this._typeToReplace = false;
            this._wordWrap = false;
            this._textAlignment = 'left';
            this._allowVerticalScrollbar = true;
            this._allowHorizontalScrollbar = false;
            this._escapedDisplayMode = textDisplayMode.DEFAULT;
        }
        static get ENABLE_WRAP_G_PROPERTY_NAME() {
            return 'EnableWrap';
        }
        static get HORIZONTAL_SCROLL_BAR_VISIBILITY_G_PROPERTY_NAME() {
            return 'HorizontalScrollBarVisibility';
        }
        static get SELECT_ALL_ON_FOCUS_G_PROPERTY_NAME() {
            return "SelectAllOnFocus";
        }
        static get VERTICAL_SCROLLBAR_VISIBILITY_G_PROPERTY_NAME() {
            return "VerticalScrollBarVisibility";
        }
        static get ESCAPE_SEQUENCE_G_PROPERTY_NAME() {
            return 'ShowEscapeSequences';
        }
        static get MODEL_KIND() {
            return 'niStringControl';
        }
        get text() {
            return this._text;
        }
        set text(value) {
            this._text = value;
            this.notifyModelPropertyChanged('text');
        }
        get escapedDisplayMode() {
            return this._escapedDisplayMode;
        }
        set escapedDisplayMode(value) {
            this._escapedDisplayMode = value;
            this.notifyModelPropertyChanged('escapedDisplayMode');
        }
        get acceptsReturn() {
            return this._acceptsReturn;
        }
        set acceptsReturn(value) {
            this._acceptsReturn = value;
            this.notifyModelPropertyChanged('acceptsReturn');
        }
        get typeToReplace() {
            return this._typeToReplace;
        }
        set typeToReplace(value) {
            this._typeToReplace = value;
            this.notifyModelPropertyChanged('typeToReplace');
        }
        get wordWrap() {
            return this._wordWrap;
        }
        set wordWrap(value) {
            this._wordWrap = value;
            this.notifyModelPropertyChanged('wordWrap');
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
        get allowVerticalScrollbar() {
            return this._allowVerticalScrollbar;
        }
        set allowVerticalScrollbar(value) {
            this._allowVerticalScrollbar = value;
            this.notifyModelPropertyChanged('allowVerticalScrollbar');
        }
        get allowHorizontalScrollbar() {
            return this._allowHorizontalScrollbar;
        }
        set allowHorizontalScrollbar(value) {
            this._allowHorizontalScrollbar = value;
            this.notifyModelPropertyChanged('allowHorizontalScrollbar');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'text';
        }
        controlChanged(newValue) {
            const oldValue = this.text;
            this.text = newValue;
            super.controlChanged('text', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.StringControlModel = StringControlModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.StringControlModel);
}());
//# sourceMappingURL=niStringControlModel.js.map