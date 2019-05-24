"use strict";
//****************************************
// Data Grid Column View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class DataGridColumnViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualComponentViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('index');
            this.registerAutoSyncProperty('header');
            this.registerAutoSyncProperty('width');
            this.registerAutoSyncProperty('fieldName');
            this.registerAutoSyncProperty('pinned');
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'aggregates':
                    renderBuffer.properties.aggregates = JSON.stringify(this.model.aggregates);
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.aggregates = JSON.parse(this.element.aggregates);
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.aggregates = JSON.stringify(this.model.aggregates);
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(DataGridColumnViewModel, NationalInstruments.HtmlVI.Elements.DataGridColumn, NationalInstruments.HtmlVI.Models.DataGridColumnModel);
    NationalInstruments.HtmlVI.ViewModels.DataGridColumnViewModel = DataGridColumnViewModel;
})();
//# sourceMappingURL=niDataGridColumnViewModel.js.map