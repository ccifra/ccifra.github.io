"use strict";
//****************************************
// Cartesian Graph Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class CartesianGraphModel extends NationalInstruments.HtmlVI.Models.GraphBaseModel {
        static get MODEL_KIND() {
            return 'niCartesianGraph';
        }
    }
    NationalInstruments.HtmlVI.Models.CartesianGraphModel = CartesianGraphModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.CartesianGraphModel);
}());
//# sourceMappingURL=niCartesianGraphModel.js.map