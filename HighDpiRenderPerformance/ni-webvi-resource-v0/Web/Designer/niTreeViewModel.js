"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//****************************************
// Tree View Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const TreeSelectionMode = NationalInstruments.HtmlVI.TreeStates.SelectionModeEnum;
    const TREE_HELPER = NationalInstruments.Controls.Tree.Helpers;
    const TreeModel = NationalInstruments.HtmlVI.Models.TreeModel;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class TreeControlViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('allowSelection');
            this.registerAutoSyncProperty('selectionMode');
            this.registerAutoSyncProperty('columnHeaders');
            this.registerAutoSyncProperty('columnHeaderVisible');
            this.registerAutoSyncProperty('columnWidths');
            this.registerAutoSyncProperty('dataSource');
            this.registerAutoSyncProperty('selection');
        }
        bindToView() {
            super.bindToView();
            const that = this;
            const treeElement = that.element;
            // The tree uses focus events (even though it's only an indicator and the text in it isn't editable)
            // so that arrow keys (for row selection) and Ctrl-A / Ctrl-C work, i.e. are handled by the browser and
            // not the IDE.
            // See HtmlTreeControlViewModel.cs for the browser key handling specifically for the tree.
            that.bindFocusEventListener();
            treeElement.addEventListener('selectionChange', function (e) {
                let newSelection = e.detail.newSelection;
                if (newSelection !== undefined) {
                    that.model.selection = newSelection;
                    let oldSelection = e.detail.oldSelection;
                    let selectedData = e.detail.selectedData;
                    const isSingleSelectionMode = that.model.selectionMode === TreeSelectionMode.SINGLE;
                    if (isSingleSelectionMode) {
                        oldSelection = (oldSelection[0] || '');
                        newSelection = (newSelection[0] || '');
                        selectedData = (selectedData[0] || TREE_HELPER.getDefaultRecordForType(that.model.niType));
                    }
                    const data = {
                        "OldSelection": oldSelection,
                        "NewSelection": newSelection,
                        "SelectedData": selectedData
                    };
                    that.model.controlEventOccurred(NationalInstruments.HtmlVI.Models.TreeModel.TREE_SELECTION_CHANGED_EVENT_NAME, data);
                }
            });
            treeElement.addEventListener('foldingChanged', function (e) {
                const data = {
                    "Location": e.detail.path,
                    "Data": e.detail.data
                };
                const eventName = e.detail.changeType === 'rowExpand'
                    ? NationalInstruments.HtmlVI.Models.TreeModel.TREE_ITEM_OPENED_EVENT_NAME : NationalInstruments.HtmlVI.Models.TreeModel.TREE_ITEM_CLOSED_EVENT_NAME;
                that.model.controlEventOccurred(eventName, data);
            });
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case TreeModel.COLUMN_HEADERS_G_PROPERTY_NAME:
                    model.columnHeaders = gPropertyValue;
                    break;
                case TreeModel.SELECTION_G_PROPERTY_NAME:
                    this._setSelection(gPropertyValue);
                    break;
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.dataSource = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(gPropertyValue);
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case TreeModel.COLUMN_HEADERS_G_PROPERTY_NAME:
                    return model.columnHeaders;
                case TreeModel.SELECTED_DATA_G_PROPERTY_NAME:
                    return this._getSelectedData();
                case TreeModel.SELECTION_G_PROPERTY_NAME:
                    return this._getSelection();
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.dataSource;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
        _setSelection(value) {
            const model = this.model;
            value = Array.isArray(value) ? value : [value];
            this._doIfPathListValid(value, (cleanPaths) => { model.selection = cleanPaths; });
        }
        _getSelection() {
            const model = this.model;
            const isMultiSelect = model.selectionMode === TreeSelectionMode.MULTIPLE;
            const selection = TREE_HELPER.ensureValidSelection(TREE_HELPER.getPathSpecifierForType(model.niType), model.dataSource, model.selection);
            return isMultiSelect ? selection : ((selection && selection[0]) || '');
        }
        _getSelectedData() {
            const model = this.model;
            const isMultiSelect = model.selectionMode === TreeSelectionMode.MULTIPLE;
            const selectedData = TREE_HELPER.getRecordsFromPaths(model.niType, model.dataSource, model.selection);
            return isMultiSelect ? selectedData : (selectedData[0] || TREE_HELPER.getDefaultRecordForType(model.niType));
        }
        invokeInternalControlFunction(functionName, args) {
            const _super = name => super[name];
            return __awaiter(this, void 0, void 0, function* () {
                yield NationalInstruments.HtmlVI.RenderEngine.waitForFrameUpdate();
                switch (functionName) {
                    case 'open':
                        return this.open(args);
                    case 'close':
                        return this.close(args);
                    default:
                        _super("invokeInternalControlFunction").call(this, functionName, args);
                }
            });
        }
        open(path) {
            if (!path) {
                this.element.expandAll();
            }
            else {
                this._doIfPathListValid([path], (cleanPaths) => { this.element.expand(cleanPaths[0]); });
            }
        }
        close(path) {
            if (!path) {
                this.element.collapseAll();
            }
            else {
                this._doIfPathListValid([path], (cleanPaths) => { this.element.collapse(cleanPaths[0]); });
            }
        }
        _doIfPathListValid(pathList, action) {
            if (action === undefined) {
                return;
            }
            const pathSpecifier = TREE_HELPER.getPathSpecifierForType(this.model.niType);
            const cleanPaths = TREE_HELPER.ensureValidSelection(pathSpecifier, this.model.dataSource, pathList);
            if (cleanPaths !== undefined) {
                action(cleanPaths);
            }
            else {
                throw new Error(NI_SUPPORT.i18n('msg_TREE_RECORD_DNE'));
            }
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            const that = this;
            switch (propertyName) {
                case 'niType':
                    renderBuffer.properties.niType = this.model.getNITypeString();
                    break;
                case 'fontSize':
                    renderBuffer.postRender.fontSize = function () {
                        that.element.updateColumnsHeight();
                    };
                    break;
            }
        }
        applyModelToElement() {
            super.applyModelToElement();
            const niType = this.model.niType;
            if (niType !== undefined) {
                this.element.niType = this.model.getNITypeString();
            }
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const niType = this.element.niType;
            if (niType !== '') {
                this.model.niType = new window.NIType(niType);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(TreeControlViewModel, null, NationalInstruments.HtmlVI.Models.TreeModel, 'ni-tree');
    NationalInstruments.HtmlVI.ViewModels.TreeControlViewModel = TreeControlViewModel;
})();
//# sourceMappingURL=niTreeViewModel.js.map