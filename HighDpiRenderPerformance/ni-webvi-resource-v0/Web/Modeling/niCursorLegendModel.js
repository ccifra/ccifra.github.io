"use strict";
//****************************************
// Cursor legend Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class CursorLegendModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._graphRef = '';
            this._isInEditMode = false;
            this._owningControlVisible = true;
        }
        static get MODEL_KIND() {
            return 'niCursorLegend';
        }
        get graphRef() {
            return this._graphRef;
        }
        set graphRef(value) {
            this._graphRef = value;
            this.notifyModelPropertyChanged('graphRef');
        }
        get isInEditMode() {
            return this._isInEditMode;
        }
        set isInEditMode(value) {
            this._isInEditMode = value;
            this.notifyModelPropertyChanged('isInEditMode');
        }
        get owningControlVisible() {
            return this._owningControlVisible;
        }
        set owningControlVisible(value) {
            this._owningControlVisible = value;
            this.notifyModelPropertyChanged('owningControlVisible');
        }
    }
    NationalInstruments.HtmlVI.Models.CursorLegendModel = CursorLegendModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.CursorLegendModel);
}());
//# sourceMappingURL=niCursorLegendModel.js.map