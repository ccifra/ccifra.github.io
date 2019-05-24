"use strict";
//****************************************
// Chart Graph Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class IntensityGraphModel extends NationalInstruments.HtmlVI.Models.GraphBaseModel {
        static get MODEL_KIND() {
            return 'niIntensityGraph';
        }
    }
    NationalInstruments.HtmlVI.Models.IntensityGraphModel = IntensityGraphModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.IntensityGraphModel);
}());
//# sourceMappingURL=niIntensityGraphModel.js.map