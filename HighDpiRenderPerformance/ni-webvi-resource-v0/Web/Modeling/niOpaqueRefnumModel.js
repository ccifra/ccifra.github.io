"use strict";
//****************************************
// OpaqueRefnum Model
// National Instruments Copyright 2014
//****************************************
(function (parent) {
    'use strict';
    class OpaqueRefnumModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        static get MODEL_KIND() {
            return 'niOpaqueRefnum';
        }
    }
    NationalInstruments.HtmlVI.Models.OpaqueRefnumModel = OpaqueRefnumModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.OpaqueRefnumModel);
}());
//# sourceMappingURL=niOpaqueRefnumModel.js.map