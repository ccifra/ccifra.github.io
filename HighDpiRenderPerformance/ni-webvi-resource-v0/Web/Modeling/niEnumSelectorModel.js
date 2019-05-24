"use strict";
//****************************************
// EnumSelector Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class EnumSelectorModel extends NationalInstruments.HtmlVI.Models.NumericValueSelectorModel {
        constructor(id) {
            super(id);
            this._textAlignment = 'left';
        }
        static get MODEL_KIND() {
            return 'niEnumSelector';
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
    }
    NationalInstruments.HtmlVI.Models.EnumSelectorModel = EnumSelectorModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.EnumSelectorModel);
}());
//# sourceMappingURL=niEnumSelectorModel.js.map