"use strict";
//****************************************
// Url Image Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const STRETCH_ENUM = NationalInstruments.HtmlVI.Elements.UrlImage.StretchEnum;
    const NITypes = window.NITypes;
    class UrlImageModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.STRING;
            this._source = '';
            this._alternate = '';
            this._stretch = STRETCH_ENUM.UNIFORM;
        }
        static get MODEL_KIND() {
            return 'niUrlImage';
        }
        get source() {
            return this._source;
        }
        set source(value) {
            this._source = value;
            this.notifyModelPropertyChanged('source');
        }
        get alternate() {
            return this._alternate;
        }
        set alternate(value) {
            this._alternate = value;
            this.notifyModelPropertyChanged('alternate');
        }
        get stretch() {
            return this._stretch;
        }
        set stretch(value) {
            this._stretch = value;
            this.notifyModelPropertyChanged('stretch');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'source';
        }
    }
    NationalInstruments.HtmlVI.Models.UrlImageModel = UrlImageModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.UrlImageModel);
}());
//# sourceMappingURL=niUrlImageModel.js.map