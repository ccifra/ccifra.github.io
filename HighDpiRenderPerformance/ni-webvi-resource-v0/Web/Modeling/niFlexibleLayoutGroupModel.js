"use strict";
//****************************************
// Flexible Layout Group Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class FlexibleLayoutGroupModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        static get MODEL_KIND() {
            return 'niFlexibleLayoutGroup';
        }
    }
    NationalInstruments.HtmlVI.Models.FlexibleLayoutGroupModel = FlexibleLayoutGroupModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.FlexibleLayoutGroupModel);
}());
//# sourceMappingURL=niFlexibleLayoutGroupModel.js.map