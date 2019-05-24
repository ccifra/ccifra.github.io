"use strict";
//****************************************
// Boolean Power Button Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class BooleanPowerButtonModel extends NationalInstruments.HtmlVI.Models.BooleanSwitchModel {
        static get MODEL_KIND() {
            return 'niBooleanPowerButton';
        }
    }
    NationalInstruments.HtmlVI.Models.BooleanPowerButtonModel = BooleanPowerButtonModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.BooleanPowerButtonModel);
}());
//# sourceMappingURL=niBooleanPowerButtonModel.js.map