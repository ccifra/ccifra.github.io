"use strict";
//****************************************
// Array viewer Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NIType = window.NIType;
    const NITypeNames = window.NITypeNames;
    const valuePropertyName = 'value';
    class ArrayViewerModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = new NIType({ name: NITypeNames.ARRAY, rank: 1, subtype: { name: NITypeNames.VOID } });
            this._rowsAndColumns = '1,1';
            this._dimensions = 1;
            this._indexEditorWidth = 53;
            this._indexVisibility = false;
            this._orientation = 'horizontal';
            this._horizontalScrollbarVisibility = false;
            this._verticalScrollbarVisibility = false;
            this._focusedCell = '';
            this._value = [];
            this._defaultElementValue = '';
        }
        static get VISIBLE_COLUMNS_G_PROPERTY_NAME() {
            return "VisibleColumns";
        }
        static get VISIBLE_ROWS_G_PROPERTY_NAME() {
            return "VisibleRows";
        }
        get rowsAndColumns() {
            return this._rowsAndColumns;
        }
        set rowsAndColumns(value) {
            this._rowsAndColumns = value;
            this.notifyModelPropertyChanged('rowsAndColumns');
        }
        get dimensions() {
            return this._dimensions;
        }
        set dimensions(value) {
            this._dimensions = value;
            this.notifyModelPropertyChanged('dimensions');
        }
        get indexEditorWidth() {
            return this._indexEditorWidth;
        }
        set indexEditorWidth(value) {
            this._indexEditorWidth = value;
            this.notifyModelPropertyChanged('indexEditorWidth');
        }
        get indexVisibility() {
            return this._indexVisibility;
        }
        set indexVisibility(value) {
            this._indexVisibility = value;
            this.notifyModelPropertyChanged('indexVisibility');
        }
        get orientation() {
            return this._orientation;
        }
        set orientation(value) {
            this._orientation = value;
            this.notifyModelPropertyChanged('orientation');
        }
        get horizontalScrollbarVisibility() {
            return this._horizontalScrollbarVisibility;
        }
        set horizontalScrollbarVisibility(value) {
            this._horizontalScrollbarVisibility = value;
            this.notifyModelPropertyChanged('horizontalScrollbarVisibility');
        }
        get verticalScrollbarVisibility() {
            return this._verticalScrollbarVisibility;
        }
        set verticalScrollbarVisibility(value) {
            this._verticalScrollbarVisibility = value;
            this.notifyModelPropertyChanged('verticalScrollbarVisibility');
        }
        get focusedCell() {
            return this._focusedCell;
        }
        set focusedCell(value) {
            this._focusedCell = value;
            this.notifyModelPropertyChanged('focusedCell');
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
            this.notifyModelPropertyChanged(valuePropertyName);
        }
        get defaultElementValue() {
            return this._defaultElementValue;
        }
        set defaultElementValue(value) {
            this._defaultElementValue = value;
            this.notifyModelPropertyChanged('defaultElementValue');
        }
        static get MODEL_KIND() {
            return 'niArrayViewer';
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === valuePropertyName;
        }
        controlChanged(newValue, oldValue) {
            this.value = newValue;
            super.controlChanged(valuePropertyName, newValue, oldValue);
        }
        // special case for keeping the editor up to date on the scroll position of the array
        scrollChanged(indices) {
            this.internalControlEventOccurred('ArrayScrolledEvent', indices);
        }
    }
    NationalInstruments.HtmlVI.Models.ArrayViewerModel = ArrayViewerModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.ArrayViewerModel);
}());
//# sourceMappingURL=niArrayViewerModel.js.map