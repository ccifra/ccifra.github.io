"use strict";
//****************************************
// Cartesian Axis Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class ColorScaleModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._axisPosition = 'right';
            this._autoScale = 'auto';
            this._showAxis = true;
            this._highColor = '#ffffff';
            this._lowColor = '#000000';
            this._markers = '';
            this._label = '';
            this._showLabel = true;
            this._show = true;
        }
        static get MODEL_KIND() {
            return 'niColorScale';
        }
        get axisPosition() {
            return this._axisPosition;
        }
        set axisPosition(value) {
            this._axisPosition = value;
            this.notifyModelPropertyChanged('axisPosition');
        }
        get autoScale() {
            return this._autoScale;
        }
        set autoScale(value) {
            this._autoScale = value;
            this.notifyModelPropertyChanged('autoScale');
        }
        get showAxis() {
            return this._showAxis;
        }
        set showAxis(value) {
            this._showAxis = value;
            this.notifyModelPropertyChanged('showAxis');
        }
        get highColor() {
            return this._highColor;
        }
        set highColor(value) {
            this._highColor = value;
            this.notifyModelPropertyChanged('highColor');
        }
        get lowColor() {
            return this._lowColor;
        }
        set lowColor(value) {
            this._lowColor = value;
            this.notifyModelPropertyChanged('lowColor');
        }
        get markers() {
            return this._markers;
        }
        set markers(value) {
            this._markers = value;
            this.notifyModelPropertyChanged('markers');
        }
        get label() {
            return this._label;
        }
        set label(value) {
            this._label = value;
            this.notifyModelPropertyChanged('label');
        }
        get showLabel() {
            return this._showLabel;
        }
        set showLabel(value) {
            this._showLabel = value;
            this.notifyModelPropertyChanged('showLabel');
        }
        get show() {
            return this._show;
        }
        set show(value) {
            this._show = value;
            this.notifyModelPropertyChanged('show');
        }
    }
    NationalInstruments.HtmlVI.Models.ColorScaleModel = ColorScaleModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.ColorScaleModel);
}());
//# sourceMappingURL=niColorScaleModel.js.map