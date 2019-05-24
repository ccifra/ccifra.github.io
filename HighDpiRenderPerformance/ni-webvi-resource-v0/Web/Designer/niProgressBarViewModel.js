"use strict";
//****************************************
// Progress Bar View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const MathHelpers = NationalInstruments.HtmlVI.MathHelpers;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class ProgressBarViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('maximum');
            this.registerAutoSyncProperty('minimum');
            this.registerAutoSyncProperty('value');
            this.registerAutoSyncProperty('indeterminate');
        }
        getReadOnlyPropertyName() {
            return 'readonly';
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'minimum':
                    renderBuffer.properties.min = this.model.minimum;
                    break;
                case 'maximum':
                    renderBuffer.properties.max = this.model.maximum;
                    break;
                case 'value':
                    renderBuffer.properties.value = this.model.value;
                    break;
                case 'indeterminate':
                    renderBuffer.properties.indeterminate = this.model.indeterminate;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.value = this.element.value;
            this.model.maximum = this.element.max;
            this.model.minimum = this.element.min;
            this.model.indeterminate = this.element.indeterminate;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.max = this.model.maximum;
            this.element.min = this.model.minimum;
            this.element.value = this.model.value;
            this.element.indeterminate = this.model.indeterminate;
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.value = MathHelpers.clamp(gPropertyValue, model.minimum, model.maximum);
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(MathHelpers.clamp(gPropertyValue, model.minimum, model.maximum));
                    break;
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
    NationalInstruments.HtmlVI.ViewModels.ProgressBarViewModel = ProgressBarViewModel;
})();
//# sourceMappingURL=niProgressBarViewModel.js.map