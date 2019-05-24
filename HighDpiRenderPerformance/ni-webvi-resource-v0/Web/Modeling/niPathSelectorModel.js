"use strict";
//****************************************
// Path Selector Control Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const PATH_TYPE_ENUM = NationalInstruments.HtmlVI.Elements.PathSelector.PathTypeEnum;
    const NITypes = window.NITypes;
    class PathSelectorModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.PATH;
            this._path = { components: [], type: PATH_TYPE_ENUM.ABSOLUTE };
            this._format = 'windows';
            this._popupEnabled = false;
            this._textAlignment = 'left';
        }
        static get MODEL_KIND() {
            return 'niPathSelector';
        }
        get path() {
            return this._path;
        }
        set path(value) {
            this._path = value;
            this.notifyModelPropertyChanged('path');
        }
        get format() {
            return this._format;
        }
        set format(value) {
            this._format = value;
            this.notifyModelPropertyChanged('format');
        }
        get popupEnabled() {
            return this._popupEnabled;
        }
        set popupEnabled(value) {
            this._popupEnabled = value;
            this.notifyModelPropertyChanged('popupEnabled');
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'path';
        }
        controlChanged(newValue) {
            const oldValue = this.path;
            this.path = newValue;
            super.controlChanged('path', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.PathSelectorModel = PathSelectorModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.PathSelectorModel);
}());
//# sourceMappingURL=niPathSelectorModel.js.map