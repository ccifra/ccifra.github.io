"use strict";
//****************************************
// Data Grid Column Model
// National Instruments Copyright 2015
//****************************************
(function (parent) {
    'use strict';
    class DataGridColumnModel extends NationalInstruments.HtmlVI.Models.VisualComponentModel {
        constructor(id) {
            super(id);
            this._index = -1;
            this._header = '';
            this._width = 50;
            this._fieldName = '';
            this._pinned = false;
            this._aggregates = {};
        }
        static get MODEL_KIND() {
            return 'niDataGridColumn';
        }
        get index() {
            return this._index;
        }
        set index(value) {
            this._index = value;
            this.notifyModelPropertyChanged('index');
        }
        get header() {
            return this._header;
        }
        set header(value) {
            this._header = value;
            this.notifyModelPropertyChanged('header');
        }
        get width() {
            return this._width;
        }
        set width(value) {
            this._width = value;
            this.notifyModelPropertyChanged('width');
        }
        get fieldName() {
            return this._fieldName;
        }
        set fieldName(value) {
            this._fieldName = value;
            this.notifyModelPropertyChanged('fieldName');
        }
        get pinned() {
            return this._pinned;
        }
        set pinned(value) {
            this._pinned = value;
            this.notifyModelPropertyChanged('pinned');
        }
        get aggregates() {
            return this._aggregates;
        }
        set aggregates(value) {
            this._aggregates = value;
            this.notifyModelPropertyChanged('aggregates');
        }
    }
    NationalInstruments.HtmlVI.Models.DataGridColumnModel = DataGridColumnModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.DataGridColumnModel);
}());
//# sourceMappingURL=niDataGridColumnModel.js.map