"use strict";
//****************************************
// Plot Renderer Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Note: The order of following properties is consistent with LabVIEW, modify it carefully.
    // And also these properties are supported by renderer element. Follow the link:https://github.com/ni-kismet/webcharts/blob/master/sources/ni-cartesian-plot-renderer.js.
    const LineStyleOptions = Object.freeze([
        'solid',
        'dot',
        'dashdot',
        'mediumdash',
        'largedash'
    ]);
    const PointShapeOptions = Object.freeze([
        'none',
        'ellipse',
        'rectangle',
        'diamond',
        'cross',
        'plus'
    ]);
    const FillStyleOptions = Object.freeze([
        'none',
        'zero',
        'positiveinfinity',
        'negativeinfinity'
    ]);
    // These values are consistent with labVIEW.
    const minLineWidth = 0;
    const maxLineWidth = 5;
    // Default value is 0.75. Follow the link: https: //github.com/ni-kismet/webcharts/blob/master/sources/ni-cartesian-plot-renderer.js.
    const defaultBarWidth = 0.75;
    class PlotRendererModel extends NationalInstruments.HtmlVI.Models.VisualComponentModel {
        constructor(id) {
            super(id);
            this._lineWidth = 1;
            this._pointSize = 1;
            this._pointColor = 'red';
            this._pointShape = 'rectangle';
            this._lineStroke = 'black';
            this._lineStyle = 'solid';
            this._areaFill = '';
            this._barFill = '';
            this._barWidth = defaultBarWidth;
            this._areaBaseLine = 'zero';
            this._barBaseLine = 'zero';
        }
        static get MODEL_KIND() {
            return 'niCartesianPlotRenderer';
        }
        static get MIN_LINE_WIDTH() {
            return minLineWidth;
        }
        static get MAX_LINE_WIDTH() {
            return maxLineWidth;
        }
        static get LINE_STYLE_OPTIONS() {
            return LineStyleOptions;
        }
        static get POINT_SHAPE_OPTIONS() {
            return PointShapeOptions;
        }
        static get FILL_STYLE_OPTIONS() {
            return FillStyleOptions;
        }
        static get DEFAULT_BAR_WIDTH() {
            return defaultBarWidth;
        }
        get lineWidth() {
            return this._lineWidth;
        }
        set lineWidth(value) {
            this._lineWidth = value;
            this.notifyModelPropertyChanged('lineWidth');
        }
        get pointSize() {
            return this._pointSize;
        }
        set pointSize(value) {
            this._pointSize = value;
            this.notifyModelPropertyChanged('pointSize');
        }
        get pointColor() {
            return this._pointColor;
        }
        set pointColor(value) {
            this._pointColor = value;
            this.notifyModelPropertyChanged('pointColor');
        }
        get pointShape() {
            return this._pointShape;
        }
        set pointShape(value) {
            this._pointShape = value;
            this.notifyModelPropertyChanged('pointShape');
        }
        get lineStroke() {
            return this._lineStroke;
        }
        set lineStroke(value) {
            this._lineStroke = value;
            this.notifyModelPropertyChanged('lineStroke');
        }
        get lineStyle() {
            return this._lineStyle;
        }
        set lineStyle(value) {
            this._lineStyle = value;
            this.notifyModelPropertyChanged('lineStyle');
        }
        get areaFill() {
            return this._areaFill;
        }
        set areaFill(value) {
            this._areaFill = value;
            this.notifyModelPropertyChanged('areaFill');
        }
        get barFill() {
            return this._barFill;
        }
        set barFill(value) {
            this._barFill = value;
            this.notifyModelPropertyChanged('barFill');
        }
        get barWidth() {
            return this._barWidth;
        }
        set barWidth(value) {
            this._barWidth = value;
            this.notifyModelPropertyChanged('barWidth');
        }
        // This property represents the fillStyle of graph.
        get areaBaseLine() {
            return this._areaBaseLine;
        }
        set areaBaseLine(value) {
            this._areaBaseLine = value;
            this.notifyModelPropertyChanged('areaBaseLine');
        }
        get barBaseLine() {
            return this._barBaseLine;
        }
        set barBaseLine(value) {
            this._barBaseLine = value;
            this.notifyModelPropertyChanged('barBaseLine');
        }
    }
    NationalInstruments.HtmlVI.Models.PlotRendererModel = PlotRendererModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.PlotRendererModel);
}());
//# sourceMappingURL=niPlotRendererModel.js.map