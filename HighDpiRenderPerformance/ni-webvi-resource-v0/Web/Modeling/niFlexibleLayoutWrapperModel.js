"use strict";
//****************************************
// Flexible Layout Wrapper Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class FlexibleLayoutWrapperModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._flexGrow = 1.0;
        }
        static get MODEL_KIND() {
            return 'niFlexibleLayoutWrapper';
        }
        get flexGrow() {
            return this._flexGrow;
        }
        set flexGrow(value) {
            this._flexGrow = value;
            this.notifyModelPropertyChanged('flexGrow');
        }
    }
    NationalInstruments.HtmlVI.Models.FlexibleLayoutWrapperModel = FlexibleLayoutWrapperModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.FlexibleLayoutWrapperModel);
}());
//# sourceMappingURL=niFlexibleLayoutWrapperModel.js.map