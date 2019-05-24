"use strict";
//****************************************
// Selector View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const SelectorModel = NationalInstruments.HtmlVI.Models.SelectorModel;
    class SelectorViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'source':
                    renderBuffer.properties.source = JSON.stringify(this.model.source);
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            if (this.element.source !== undefined) {
                this.model.source = JSON.parse(this.element.source);
            }
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.source = JSON.stringify(this.model.source);
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case SelectorModel.ITEMS_G_PROPERTY_NAME:
                    model.source = gPropertyValue;
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case SelectorModel.ITEMS_G_PROPERTY_NAME:
                    return model.source;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.ViewModels.SelectorViewModel = SelectorViewModel;
})();
//# sourceMappingURL=niSelectorViewModel.js.map