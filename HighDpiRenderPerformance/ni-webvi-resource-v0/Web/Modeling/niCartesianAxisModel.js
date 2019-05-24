"use strict";
//****************************************
// Cartesian Axis Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // This order is consistent with NXG so don't change it.
    const FIT_TYPES = Object.freeze(["exact", "loose", "growloose", "none", "growexact", "auto"]);
    const FIT_INDICES = Object.freeze({
        "exact": 0,
        "loose": 1,
        "growloose": 2,
        "none": 3,
        "growexact": 4,
        "auto": 5
    });
    class CartesianAxisModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._autoScale = FIT_TYPES[FIT_INDICES.auto];
            this._maximum = 0;
            this._minimum = 0;
            this._axisPosition = 'left';
            this._showLabel = true;
            this._label = '';
            this._logScale = false;
            this._show = true;
            this._format = '';
            this._showTickLabels = 'all';
            this._gridLines = true;
            this._showTicks = true;
            this._showMinorTicks = true;
            this._foreground = 'unset';
        }
        static get FIT_TYPE_G_PROPERTY_NAME() {
            return 'FitType';
        }
        static get MAPPING_G_PROPERTY_NAME() {
            return "Mapping";
        }
        static get RANGE_G_PROPERTY_NAME() {
            return "Range";
        }
        static get MODEL_KIND() {
            return 'niCartesianAxis';
        }
        get autoScale() {
            return this._autoScale;
        }
        set autoScale(value) {
            this._autoScale = value;
            this.notifyModelPropertyChanged('autoScale');
        }
        get maximum() {
            return this._maximum;
        }
        set maximum(value) {
            this._maximum = value;
            this.notifyModelPropertyChanged('maximum');
        }
        get minimum() {
            return this._minimum;
        }
        set minimum(value) {
            this._minimum = value;
            this.notifyModelPropertyChanged('minimum');
        }
        get axisPosition() {
            return this._axisPosition;
        }
        set axisPosition(value) {
            this._axisPosition = value;
            this.notifyModelPropertyChanged('axisPosition');
        }
        get showLabel() {
            return this._showLabel;
        }
        set showLabel(value) {
            this._showLabel = value;
            this.notifyModelPropertyChanged('showLabel');
        }
        get label() {
            return this._label;
        }
        set label(value) {
            this._label = value;
            this.notifyModelPropertyChanged('label');
        }
        get logScale() {
            return this._logScale;
        }
        set logScale(value) {
            this._logScale = value;
            this.notifyModelPropertyChanged('logScale');
        }
        get show() {
            return this._show;
        }
        set show(value) {
            this._show = value;
            this.notifyModelPropertyChanged('show');
        }
        get format() {
            return this._format;
        }
        set format(value) {
            this._format = value;
            this.notifyModelPropertyChanged('format');
        }
        get showTickLabels() {
            return this._showTickLabels;
        }
        set showTickLabels(value) {
            this._showTickLabels = value;
            this.notifyModelPropertyChanged('showTickLabels');
        }
        get gridLines() {
            return this._gridLines;
        }
        set gridLines(value) {
            this._gridLines = value;
            this.notifyModelPropertyChanged('gridLines');
        }
        get showTicks() {
            return this._showTicks;
        }
        set showTicks(value) {
            this._showTicks = value;
            this.notifyModelPropertyChanged('showTicks');
        }
        get showMinorTicks() {
            return this._showMinorTicks;
        }
        set showMinorTicks(value) {
            this._showMinorTicks = value;
            this.notifyModelPropertyChanged('showMinorTicks');
        }
        get foreground() {
            return this._foreground;
        }
        set foreground(value) {
            this._foreground = value;
            this.notifyModelPropertyChanged('foreground');
        }
    }
    NationalInstruments.HtmlVI.Models.CartesianAxisModel = CartesianAxisModel;
    NationalInstruments.HtmlVI.Models.CartesianAxisModel.FitTypesEnum = FIT_TYPES;
    NationalInstruments.HtmlVI.Models.CartesianAxisModel.FitIndicesEnum = FIT_INDICES;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.CartesianAxisModel);
}());
//# sourceMappingURL=niCartesianAxisModel.js.map