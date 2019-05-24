"use strict";
//****************************************
// Scale legend Model
// National Instruments Copyright 2015
//****************************************
(function (parent) {
    'use strict';
    class ScaleLegendModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._graphRef = '';
            this._isInEditMode = false;
            this._owningControlVisible = true;
        }
        static get MODEL_KIND() {
            return 'niScaleLegend';
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
    NationalInstruments.HtmlVI.Models.ScaleLegendModel = ScaleLegendModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.ScaleLegendModel);
}());
//# sourceMappingURL=niScaleLegendModel.js.map