"use strict";
//****************************************
// Hyperlink Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const NITypes = window.NITypes;
    class HyperlinkModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.STRING;
            this._href = '';
            this._content = '';
            this._textAlignment = 'left';
        }
        static get MODEL_KIND() {
            return 'niHyperlink';
        }
        get href() {
            return this._href;
        }
        set href(value) {
            this._href = value;
            this.notifyModelPropertyChanged('href');
        }
        get content() {
            return this._content;
        }
        set content(value) {
            this._content = value;
            this.notifyModelPropertyChanged('content');
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'href';
        }
        controlChanged(newValue) {
            const oldValue = this.href;
            this.href = newValue;
            super.controlChanged('href', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.HyperlinkModel = HyperlinkModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.HyperlinkModel);
}());
//# sourceMappingURL=niHyperlinkModel.js.map