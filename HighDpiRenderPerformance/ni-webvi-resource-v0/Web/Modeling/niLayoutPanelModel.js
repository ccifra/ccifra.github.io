"use strict";
//****************************************
// Layout Panel Model
// National Instruments Copyright 2014
//****************************************
(function (parent) {
    'use strict';
    class LayoutPanelModel extends NationalInstruments.HtmlVI.Models.LayoutControlModel {
        static get MODEL_KIND() {
            return 'niLayoutPanel';
        }
    }
    NationalInstruments.HtmlVI.Models.LayoutPanelModel = LayoutPanelModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.LayoutPanelModel);
}());
//# sourceMappingURL=niLayoutPanelModel.js.map