"use strict";
//****************************************
// Tank Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class TankModel extends NationalInstruments.HtmlVI.Models.LinearNumericPointerModel {
        static get MODEL_KIND() {
            return 'niTank';
        }
    }
    NationalInstruments.HtmlVI.Models.TankModel = TankModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.TankModel);
}());
//# sourceMappingURL=niTankModel.js.map