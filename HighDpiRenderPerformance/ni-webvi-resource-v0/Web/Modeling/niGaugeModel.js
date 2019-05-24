"use strict";
//****************************************
// Gauge Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class GaugeModel extends NationalInstruments.HtmlVI.Models.RadialNumericPointerModel {
        constructor(id) {
            super(id);
            this._analogDisplayType = 'needle';
            this._digitalDisplayVisible = false;
            this._digitalDisplayPosition = 'bottom';
        }
        static get MODEL_KIND() {
            return 'niGauge';
        }
        get analogDisplayType() {
            return this._analogDisplayType;
        }
        set analogDisplayType(value) {
            this._analogDisplayType = value;
            this.notifyModelPropertyChanged('analogDisplayType');
        }
        get digitalDisplayVisible() {
            return this._digitalDisplayVisible;
        }
        set digitalDisplayVisible(value) {
            this._digitalDisplayVisible = value;
            this.notifyModelPropertyChanged('digitalDisplayVisible');
        }
        get digitalDisplayPosition() {
            return this._digitalDisplayPosition;
        }
        set digitalDisplayPosition(value) {
            this._digitalDisplayPosition = value;
            this.notifyModelPropertyChanged('digitalDisplayPosition');
        }
    }
    NationalInstruments.HtmlVI.Models.GaugeModel = GaugeModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.GaugeModel);
}());
//# sourceMappingURL=niGaugeModel.js.map