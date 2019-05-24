"use strict";
//****************************************
// Data Grid Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const NIType = window.NIType;
    class DataGridModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = new NIType({ name: 'Array', rank: 1, subtype: { name: 'Cluster', fields: [] } });
            this._rowHeaderVisible = true;
            this._columnHeaderVisible = true;
            this._showAddRowsToolBar = true;
            this._allowSorting = false;
            this._allowPaging = false;
            this._allowFiltering = false;
            this._allowGrouping = false;
            this._rowHeight = 25;
            this._altRowColors = false;
            this._altRowStart = 1;
            this._altRowStep = 1;
            this._value = [];
            this._isInEditMode = false;
            this._selectedColumn = -1;
        }
        static get MODEL_KIND() {
            return 'niDataGrid';
        }
        get rowHeaderVisible() {
            return this._rowHeaderVisible;
        }
        set rowHeaderVisible(value) {
            this._rowHeaderVisible = value;
            this.notifyModelPropertyChanged('rowHeaderVisible');
        }
        get columnHeaderVisible() {
            return this._columnHeaderVisible;
        }
        set columnHeaderVisible(value) {
            this._columnHeaderVisible = value;
            this.notifyModelPropertyChanged('columnHeaderVisible');
        }
        get showAddRowsToolBar() {
            return this._showAddRowsToolBar;
        }
        set showAddRowsToolBar(value) {
            this._showAddRowsToolBar = value;
            this.notifyModelPropertyChanged('showAddRowsToolBar');
        }
        get allowSorting() {
            return this._allowSorting;
        }
        set allowSorting(value) {
            this._allowSorting = value;
            this.notifyModelPropertyChanged('allowSorting');
        }
        get allowPaging() {
            return this._allowPaging;
        }
        set allowPaging(value) {
            this._allowPaging = value;
            this.notifyModelPropertyChanged('allowPaging');
        }
        get allowFiltering() {
            return this._allowFiltering;
        }
        set allowFiltering(value) {
            this._allowFiltering = value;
            this.notifyModelPropertyChanged('allowFiltering');
        }
        get allowGrouping() {
            return this._allowGrouping;
        }
        set allowGrouping(value) {
            this._allowGrouping = value;
            this.notifyModelPropertyChanged('allowGrouping');
        }
        get rowHeight() {
            return this._rowHeight;
        }
        set rowHeight(value) {
            this._rowHeight = value;
            this.notifyModelPropertyChanged('rowHeight');
        }
        get altRowColors() {
            return this._altRowColors;
        }
        set altRowColors(value) {
            this._altRowColors = value;
            this.notifyModelPropertyChanged('altRowColors');
        }
        get altRowStart() {
            return this._altRowStart;
        }
        set altRowStart(value) {
            this._altRowStart = value;
            this.notifyModelPropertyChanged('altRowStart');
        }
        get altRowStep() {
            return this._altRowStep;
        }
        set altRowStep(value) {
            this._altRowStep = value;
            this.notifyModelPropertyChanged('altRowStep');
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
            this.notifyModelPropertyChanged('value');
        }
        get isInEditMode() {
            return this._isInEditMode;
        }
        set isInEditMode(value) {
            this._isInEditMode = value;
            this.notifyModelPropertyChanged('isInEditMode');
        }
        get selectedColumn() {
            return this._selectedColumn;
        }
        set selectedColumn(value) {
            this._selectedColumn = value;
            this.notifyModelPropertyChanged('selectedColumn');
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'value';
        }
        controlChanged(newValue, oldValue) {
            this.value = newValue;
            super.controlChanged('value', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.DataGridModel = DataGridModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.DataGridModel);
}());
//# sourceMappingURL=niDataGridModel.js.map