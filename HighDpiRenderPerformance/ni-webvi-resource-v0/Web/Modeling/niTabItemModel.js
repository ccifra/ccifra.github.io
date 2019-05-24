"use strict";
//****************************************
// Tab Item Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class TabItemModel extends NationalInstruments.HtmlVI.Models.LayoutControlModel {
        constructor(id) {
            super(id);
            this._header = 0;
            this._tabPosition = 0;
        }
        static get ENABLED_G_PROPERTY_NAME() {
            return 'Enabled';
        }
        static get NAME_G_PROPERTY_NAME() {
            return "Name";
        }
        static get MODEL_KIND() {
            return 'niTabItem';
        }
        get header() {
            return this._header;
        }
        set header(value) {
            this._header = value;
            this.notifyModelPropertyChanged('header');
        }
        get tabPosition() {
            return this._tabPosition;
        }
        set tabPosition(value) {
            this._tabPosition = value;
            this.notifyModelPropertyChanged('tabPosition');
        }
    }
    NationalInstruments.HtmlVI.Models.TabItemModel = TabItemModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.TabItemModel);
}());
//# sourceMappingURL=niTabItemModel.js.map