"use strict";
//****************************************
// Tree Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    const dataSourcePropertyName = 'dataSource';
    const TreeSelectionMode = NationalInstruments.HtmlVI.TreeStates.SelectionModeEnum;
    class TreeModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._allowSelection = false;
            this._selectionMode = TreeSelectionMode.SINGLE;
            this._columnHeaderVisible = false;
            this._dataSource = [];
            this._selection = [];
            this._columnHeaders = [];
            this._columnWidths = [];
        }
        static get COLUMN_HEADERS_G_PROPERTY_NAME() {
            return 'ColumnHeaders';
        }
        static get SELECTION_G_PROPERTY_NAME() {
            return "Selection";
        }
        static get SELECTED_DATA_G_PROPERTY_NAME() {
            return "SelectedData";
        }
        static get MODEL_KIND() {
            return 'niTree';
        }
        /**
         * The GUID identifying the TreeItemClosedDiagramEvent.
         */
        static get TREE_ITEM_CLOSED_EVENT_GUID() {
            return '{6C4A7AD1-D46D-4633-9209-8B3102ADFAFC}';
        }
        /**
         * The event index identifying the TreeItemClosedDiagramEvent.
         */
        static get TREE_ITEM_CLOSED_EVENT_INDEX() {
            return 102;
        }
        /**
         * The JS event name which triggers the event TreeItemClosedDiagramEvent listens for.
         */
        static get TREE_ITEM_CLOSED_EVENT_NAME() {
            return 'itemClosed';
        }
        /**
         * The GUID identifying the TreeItemOpenedDiagramEvent.
         */
        static get TREE_ITEM_OPENED_EVENT_GUID() {
            return '{F15EEBAF-E49D-4B9E-87DA-1E4E2EF27C7B}';
        }
        /**
         * The event index identifying the TreeItemOpenedDiagramEvent.
         */
        static get TREE_ITEM_OPENED_EVENT_INDEX() {
            return 101;
        }
        /**
         * The JS event name which triggers the event TreeItemOpenedDiagramEvent listens for.
         */
        static get TREE_ITEM_OPENED_EVENT_NAME() {
            return 'itemOpened';
        }
        /**
         * The GUID identifying the TreeSelectionChangedDiagramEvent.
         */
        static get TREE_SELECTION_CHANGED_EVENT_GUID() {
            return '{1B69D1DB-B701-4D6D-B5B0-3EA4FF0E9888}';
        }
        /**
         * The event index identifying the TreeSelectionChangedDiagramEvent.
         */
        static get TREE_SELECTION_CHANGED_EVENT_INDEX() {
            return 100;
        }
        /**
         * The JS event name which triggers the event TreeSelectionChangedDiagramEvent listens for.
         */
        static get TREE_SELECTION_CHANGED_EVENT_NAME() {
            return 'treeSelectionChanged';
        }
        get allowSelection() {
            return this._allowSelection;
        }
        set allowSelection(value) {
            this._allowSelection = value;
            this.notifyModelPropertyChanged('allowSelection');
        }
        get selectionMode() {
            return this._selectionMode;
        }
        set selectionMode(value) {
            this._selectionMode = value;
            this.notifyModelPropertyChanged('selectionMode');
        }
        get columnHeaders() {
            return this._columnHeaders;
        }
        set columnHeaders(value) {
            this._columnHeaders = value;
            this.notifyModelPropertyChanged('columnHeaders');
        }
        get columnHeaderVisible() {
            return this._columnHeaderVisible;
        }
        set columnHeaderVisible(value) {
            this._columnHeaderVisible = value;
            this.notifyModelPropertyChanged('columnHeaderVisible');
        }
        get columnWidths() {
            return this._columnWidths;
        }
        set columnWidths(value) {
            this._columnWidths = value;
            this.notifyModelPropertyChanged('columnWidths');
        }
        get dataSource() {
            return this._dataSource;
        }
        set dataSource(value) {
            this._dataSource = value;
            this.notifyModelPropertyChanged(dataSourcePropertyName);
        }
        get selection() {
            return this._selection;
        }
        set selection(value) {
            this._selection = value;
            this.notifyModelPropertyChanged('selection');
        }
        gPropertyNIType(gPropertyName) {
            if (gPropertyName === 'SelectedData') {
                return this.selectionMode === TreeSelectionMode.MULTIPLE ? this.niType : this.niType.getSubtype();
            }
            return super.gPropertyNIType(gPropertyName);
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === dataSourcePropertyName;
        }
        controlChanged(newValue) {
            const oldValue = this.dataSource;
            this.dataSource = newValue;
            super.controlChanged('dataSource', newValue, oldValue);
        }
        getLocalEventInfo(eventName) {
            if (eventName === NationalInstruments.HtmlVI.Models.TreeModel.TREE_ITEM_CLOSED_EVENT_NAME) {
                return {
                    eventIndex: NationalInstruments.HtmlVI.Models.TreeModel.TREE_ITEM_CLOSED_EVENT_INDEX,
                    eventDataId: NationalInstruments.HtmlVI.Models.TreeModel.TREE_ITEM_CLOSED_EVENT_GUID
                };
            }
            if (eventName === NationalInstruments.HtmlVI.Models.TreeModel.TREE_ITEM_OPENED_EVENT_NAME) {
                return {
                    eventIndex: NationalInstruments.HtmlVI.Models.TreeModel.TREE_ITEM_OPENED_EVENT_INDEX,
                    eventDataId: NationalInstruments.HtmlVI.Models.TreeModel.TREE_ITEM_OPENED_EVENT_GUID
                };
            }
            if (eventName === NationalInstruments.HtmlVI.Models.TreeModel.TREE_SELECTION_CHANGED_EVENT_NAME) {
                return {
                    eventIndex: NationalInstruments.HtmlVI.Models.TreeModel.TREE_SELECTION_CHANGED_EVENT_INDEX,
                    eventDataId: NationalInstruments.HtmlVI.Models.TreeModel.TREE_SELECTION_CHANGED_EVENT_GUID
                };
            }
            return super.getLocalEventInfo(eventName);
        }
    }
    NationalInstruments.HtmlVI.Models.TreeModel = TreeModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.TreeModel);
}());
//# sourceMappingURL=niTreeModel.js.map