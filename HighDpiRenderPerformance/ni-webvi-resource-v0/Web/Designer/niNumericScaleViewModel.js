"use strict";
//****************************************
// NumericScale View Model
// This view model doesn't have a dedicated model and element.
// It is only used as a proxy object for get/set G properties.
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class NumericScaleViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(owningNumericPointerElement, owningNumericPointerModel) {
            super(owningNumericPointerElement, owningNumericPointerModel);
            this.owningNumericPointerModel = owningNumericPointerModel;
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            switch (gPropertyName) {
                case VisualModel.VISIBLE_G_PROPERTY_NAME:
                    this.owningNumericPointerModel.scaleVisible = gPropertyValue;
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            switch (gPropertyName) {
                case VisualModel.VISIBLE_G_PROPERTY_NAME:
                    return this.owningNumericPointerModel.scaleVisible;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.ViewModels.NumericScaleViewModel = NumericScaleViewModel;
})();
//# sourceMappingURL=niNumericScaleViewModel.js.map