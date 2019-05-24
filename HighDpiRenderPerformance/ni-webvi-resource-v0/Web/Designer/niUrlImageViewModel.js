"use strict";
//****************************************
// Url Image View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class UrlImageViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('alternate');
            this.registerAutoSyncProperty('stretch');
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'source':
                    renderBuffer.properties.sourceNonSignaling = this.model.source;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.defaultValue = this.element.source;
            this.model.source = this.element.source;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.sourceNonSignaling = this.model.source;
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.source = gPropertyValue;
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.source;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(UrlImageViewModel, NationalInstruments.HtmlVI.Elements.UrlImage, NationalInstruments.HtmlVI.Models.UrlImageModel);
    NationalInstruments.HtmlVI.ViewModels.UrlImageViewModel = UrlImageViewModel;
})();
//# sourceMappingURL=niUrlImageViewModel.js.map