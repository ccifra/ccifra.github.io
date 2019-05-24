"use strict";
//****************************************
// Boolean Button Model
// National Instruments Copyright 2014
//****************************************
(function (parent) {
    'use strict';
    const NITypes = window.NITypes;
    class TabControlModel extends NationalInstruments.HtmlVI.Models.LayoutControlModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.INT32;
            this._tabStripPlacement = 'top';
            this._selectedIndex = 0;
            this._activeTab = 0;
        }
        static get ACTIVE_TAB_G_PROPERTY_NAME() {
            return 'ActiveTab';
        }
        static get TAB_G_PROPERTY_NAME() {
            return "Tab";
        }
        static get MODEL_KIND() {
            return 'niTabControl';
        }
        get tabStripPlacement() {
            return this._tabStripPlacement;
        }
        set tabStripPlacement(value) {
            this._tabStripPlacement = value;
            this.notifyModelPropertyChanged('tabStripPlacement');
        }
        get selectedIndex() {
            return this._selectedIndex;
        }
        set selectedIndex(value) {
            this._selectedIndex = value;
            this.notifyModelPropertyChanged('selectedIndex');
        }
        get activeTab() {
            return this._activeTab;
        }
        set activeTab(value) {
            this._activeTab = value;
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'selectedIndex';
        }
        controlChanged(newValue) {
            const oldValue = this.selectedIndex;
            this.selectedIndex = newValue;
            super.controlChanged('selectedIndex', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.TabControlModel = TabControlModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.TabControlModel);
}());
//# sourceMappingURL=niTabControlModel.js.map