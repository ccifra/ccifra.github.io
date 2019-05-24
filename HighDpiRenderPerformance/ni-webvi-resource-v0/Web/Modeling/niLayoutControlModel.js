"use strict";
//****************************************
// Layout Control Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class LayoutControlModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._layout = LAYOUTS_ENUM.ABSOLUTE;
            this._minHeight = '0px';
        }
        get layout() {
            return this._layout;
        }
        set layout(value) {
            this._layout = value;
            this.notifyModelPropertyChanged('layout');
        }
        get minHeight() {
            return this._minHeight;
        }
        set minHeight(value) {
            this._minHeight = value;
            this.notifyModelPropertyChanged('minHeight');
        }
        isAbsoluteLayoutRoot() {
            return this.layout === LAYOUTS_ENUM.ABSOLUTE;
        }
        isFlexibleLayoutRoot() {
            return this.layout === LAYOUTS_ENUM.FLEXIBLE;
        }
    }
    NationalInstruments.HtmlVI.Models.LayoutControlModel = LayoutControlModel;
    const LAYOUTS_ENUM = NationalInstruments.HtmlVI.Elements.LayoutControl.LayoutsEnum;
}());
//# sourceMappingURL=niLayoutControlModel.js.map