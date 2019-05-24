"use strict";
//****************************************
// Flexible Layout Component Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class FlexibleLayoutComponentModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._layoutPattern = '';
        }
        static get MODEL_KIND() {
            return 'niFlexibleLayoutComponent';
        }
        get layoutPattern() {
            return this._layoutPattern;
        }
        set layoutPattern(value) {
            this._layoutPattern = value;
            this.notifyModelPropertyChanged('layoutPattern');
        }
        isFlexibleLayout() {
            return true;
        }
    }
    NationalInstruments.HtmlVI.Models.FlexibleLayoutComponentModel = FlexibleLayoutComponentModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.FlexibleLayoutComponentModel);
}());
//# sourceMappingURL=niFlexibleLayoutComponentModel.js.map