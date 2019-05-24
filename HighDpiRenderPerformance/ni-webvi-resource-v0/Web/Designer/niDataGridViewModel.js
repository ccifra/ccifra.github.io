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
// Data Grid View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class DataGridViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('rowHeaderVisible');
            this.registerAutoSyncProperty('columnHeaderVisible');
            this.registerAutoSyncProperty('showAddRowsToolBar');
            this.registerAutoSyncProperty('allowSorting');
            this.registerAutoSyncProperty('allowPaging');
            this.registerAutoSyncProperty('allowFiltering');
            this.registerAutoSyncProperty('allowGrouping');
            this.registerAutoSyncProperty('rowHeight');
            this.registerAutoSyncProperty('altRowColors');
            this.registerAutoSyncProperty('altRowStart');
            this.registerAutoSyncProperty('altRowStep');
            this.registerAutoSyncProperty('isInEditMode');
            this.registerAutoSyncProperty('selectedColumn');
        }
        bindToView() {
            super.bindToView();
            const that = this;
            that.enableResizeHack();
            that.bindFocusEventListener();
            that.element.addEventListener('value-changed', function (event) {
                let newValue, oldValue;
                if (event.currentTarget === event.target) {
                    newValue = event.detail.newValue;
                    oldValue = event.detail.oldValue;
                    that.model.controlChanged(newValue, oldValue);
                }
            });
            that.element.addEventListener('selected-column-changed', function (event) {
                that.model.internalControlEventOccurred('DataGridSelectedIndexChanged', event.detail.selectedColumn);
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'value':
                    renderBuffer.properties.valueNonSignaling = this.model.value;
                    break;
                case 'niType':
                    renderBuffer.properties.niType = this.model.getNITypeString();
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.niType = new window.NIType(this.element.niType);
            this.model.value = this.element.value;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.niType = this.model.getNITypeString();
            this.element.valueNonSignaling = this.model.value;
        }
        invokeInternalControlFunction(functionName, args) {
            const _super = name => super[name];
            return __awaiter(this, void 0, void 0, function* () {
                switch (functionName) {
                    case 'getColumnWidths':
                        return this.element.getColumnWidths();
                }
                _super("invokeInternalControlFunction").call(this, functionName, args);
            });
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.value = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    {
                        const oldValue = model.value;
                        model.controlChanged(gPropertyValue, oldValue);
                        break;
                    }
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.value;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(DataGridViewModel, NationalInstruments.HtmlVI.Elements.DataGrid, NationalInstruments.HtmlVI.Models.DataGridModel);
    NationalInstruments.HtmlVI.ViewModels.DataGridViewModel = DataGridViewModel;
})();
//# sourceMappingURL=niDataGridViewModel.js.map