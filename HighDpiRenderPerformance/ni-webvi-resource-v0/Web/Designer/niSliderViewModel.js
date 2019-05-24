"use strict";
//****************************************
// Slider View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class SliderViewModel extends NationalInstruments.HtmlVI.ViewModels.LinearNumericPointerViewModel {
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'showTooltip':
                    renderBuffer.properties.showTooltip = this.model.showTooltip;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.showTooltip = this.element.showTooltip;
            this.model.mechanicalAction = this.element.mechanicalAction;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.showTooltip = this.model.showTooltip;
            this.element.mechanicalAction = this.model.mechanicalAction;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(SliderViewModel, null, NationalInstruments.HtmlVI.Models.SliderModel, 'jqx-slider');
    NationalInstruments.HtmlVI.ViewModels.SliderViewModel = SliderViewModel;
})();
//# sourceMappingURL=niSliderViewModel.js.map