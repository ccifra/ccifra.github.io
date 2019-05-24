"use strict";
//****************************************
// Cursor Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class CursorModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._show = true;
            this._showLabel = true;
            this._showValue = true;
            this._color = 'black';
            this._targetShape = 'ellipse';
            this._label = '';
            this._snapToPlot = '';
            this._xaxis = '';
            this._yaxis = '';
            this._crosshairStyle = 'both';
            this._x = 0.5; // relative position on canvas from left in range 0-1
            this._y = 0.5; // relative position on canvas from top in range 0-1
        }
        static get NAME_G_PROPERTY_NAME() {
            return "Name";
        }
        static get X_POSITION_G_PROPERTY_NAME() {
            return "XPosition";
        }
        static get Y_POSITION_G_PROPERTY_NAME() {
            return "YPosition";
        }
        static get MODEL_KIND() {
            return 'niCursor';
        }
        get show() {
            return this._show;
        }
        set show(value) {
            this._show = value;
            this.notifyModelPropertyChanged('show');
        }
        get showLabel() {
            return this._showLabel;
        }
        set showLabel(value) {
            this._showLabel = value;
            this.notifyModelPropertyChanged('showLabel');
        }
        get showValue() {
            return this._showValue;
        }
        set showValue(value) {
            this._showValue = value;
            this.notifyModelPropertyChanged('showValue');
        }
        get color() {
            return this._color;
        }
        set color(value) {
            this._color = value;
            this.notifyModelPropertyChanged('color');
        }
        get targetShape() {
            return this._targetShape;
        }
        set targetShape(value) {
            this._targetShape = value;
            this.notifyModelPropertyChanged('targetShape');
        }
        get label() {
            return this._label;
        }
        set label(value) {
            this._label = value;
            this.notifyModelPropertyChanged('label');
        }
        get snapToPlot() {
            return this._snapToPlot;
        }
        set snapToPlot(value) {
            this._snapToPlot = value;
            this.notifyModelPropertyChanged('snapToPlot');
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
        get crosshairStyle() {
            return this._crosshairStyle;
        }
        set crosshairStyle(value) {
            this._crosshairStyle = value;
            this.notifyModelPropertyChanged('crosshairStyle');
        }
        get x() {
            return this._x;
        }
        set x(value) {
            this._x = value;
            this.notifyModelPropertyChanged('x');
        }
        get y() {
            return this._y;
        }
        set y(value) {
            this._y = value;
            this.notifyModelPropertyChanged('y');
        }
        getPosition() {
            return {
                x: this.x,
                y: this.y
            };
        }
        setPosition(pos) {
            this.x = pos.x;
            this.y = pos.y;
        }
        controlChanged(newValue) {
            const oldX = this.x;
            const oldY = this.y;
            this.x = newValue.x;
            this.y = newValue.y;
            super.controlChanged('x', newValue.x, oldX);
            super.controlChanged('y', newValue.y, oldY);
        }
    }
    NationalInstruments.HtmlVI.Models.CursorModel = CursorModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.CursorModel);
}());
//# sourceMappingURL=niCursorModel.js.map