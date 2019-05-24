"use strict";
//****************************************
// Cartesian Plot Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class CartesianPlotModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._label = '';
            this._show = false;
            this._xaxis = null;
            this._yaxis = null;
            this._enableHover = false;
            this._hoverFormat = '';
            this._showLabel = undefined;
        }
        static get BAR_WIDTH_G_PROPERTY_NAME() {
            return 'BarWidth';
        }
        static get COLOR_G_PROPERTY_NAME() {
            return 'Color';
        }
        static get FILL_STYLE_G_PROPERTY_NAME() {
            return 'FillStyle';
        }
        static get LINE_STYLE_G_PROPERTY_NAME() {
            return 'LineStyle';
        }
        static get LINE_WIDTH_G_PROPERTY_NAME() {
            return 'LineWidth';
        }
        static get NAME_G_PROPERTY_NAME() {
            return "Name";
        }
        static get POINT_SHAPE_G_PROPERTY_NAME() {
            return "PointShape";
        }
        static get X_AXIS_INDEX_G_PROPERTY_NAME() {
            return "XAxisIndex";
        }
        static get Y_AXIS_INDEX_G_PROPERTY_NAME() {
            return "YAxisIndex";
        }
        static get MODEL_KIND() {
            return 'niCartesianPlot';
        }
        get label() {
            return this._label;
        }
        set label(value) {
            this._label = value;
            this.notifyModelPropertyChanged('label');
        }
        get show() {
            return this._show;
        }
        set show(value) {
            this._show = value;
            this.notifyModelPropertyChanged('show');
        }
        get xaxis() {
            return this._xaxis;
        }
        set xaxis(value) {
            this._xaxis = value;
            this.notifyModelPropertyChanged('xaxis');
        }
        get yaxis() {
            return this._yaxis;
        }
        set yaxis(value) {
            this._yaxis = value;
            this.notifyModelPropertyChanged('yaxis');
        }
        get enableHover() {
            return this._enableHover;
        }
        set enableHover(value) {
            this._enableHover = value;
            this.notifyModelPropertyChanged('enableHover');
        }
        get hoverFormat() {
            return this._hoverFormat;
        }
        set hoverFormat(value) {
            this._hoverFormat = value;
            this.notifyModelPropertyChanged('hoverFormat');
        }
        get showLabel() {
            return undefined;
        }
        set showLabel(value) {
        }
    }
    NationalInstruments.HtmlVI.Models.CartesianPlotModel = CartesianPlotModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.CartesianPlotModel);
}());
//# sourceMappingURL=niCartesianPlotModel.js.map