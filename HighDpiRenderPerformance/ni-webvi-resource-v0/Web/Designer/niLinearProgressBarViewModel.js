"use strict";
//****************************************
// Linear Progress Bar View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class LinearProgressBarViewModel extends NationalInstruments.HtmlVI.ViewModels.ProgressBarViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('orientation');
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'orientation':
                    renderBuffer.properties.orientation = this.model.orientation;
                    if (this.model.orientation === 'vertical') {
                        renderBuffer.properties.inverted = true;
                    }
                    else {
                        renderBuffer.properties.inverted = false;
                    }
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.orientation = this.element.orientation;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.orientation = this.model.orientation;
            if (this.model.orientation === 'vertical') {
                this.element.inverted = true;
            }
            else {
                this.element.inverted = false;
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(LinearProgressBarViewModel, null, NationalInstruments.HtmlVI.Models.LinearProgressBarModel, 'jqx-progress-bar');
    NationalInstruments.HtmlVI.ViewModels.LinearProgressBarViewModel = LinearProgressBarViewModel;
})();
//# sourceMappingURL=niLinearProgressBarViewModel.js.map