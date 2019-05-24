"use strict";
//****************************************
// Radial Numeric Pointer Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class RadialNumericPointerModel extends NationalInstruments.HtmlVI.Models.NumericPointerModel {
        constructor(id) {
            super(id);
            this._scaleArc = {
                startAngle: 0,
                sweepAngle: 180
            };
        }
        get scaleArc() {
            return this._scaleArc;
        }
        set scaleArc(value) {
            this._scaleArc = value;
            this.notifyModelPropertyChanged('scaleArc');
        }
    }
    NationalInstruments.HtmlVI.Models.RadialNumericPointerModel = RadialNumericPointerModel;
}());
//# sourceMappingURL=niRadialNumericPointerModel.js.map