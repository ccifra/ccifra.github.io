"use strict";
//****************************************
// Selector Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class SelectorModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._source = [];
        }
        static get ITEMS_G_PROPERTY_NAME() {
            return 'Items';
        }
        get source() {
            return this._source;
        }
        set source(value) {
            this._source = value;
            this.notifyModelPropertyChanged('source');
        }
    }
    NationalInstruments.HtmlVI.Models.SelectorModel = SelectorModel;
}());
//# sourceMappingURL=niSelectorModel.js.map