"use strict";
//****************************************
// Gauge View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NUM_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter;
    class GaugeViewModel extends NationalInstruments.HtmlVI.ViewModels.RadialNumericPointerViewModel {
        bindToView() {
            super.bindToView();
            const that = this;
            that.element.addEventListener('change', function (event) {
                const newValue = NUM_VAL_CONVERTER.convertBack(event.detail.value, that.model.niType);
                that.model.controlChanged(newValue);
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'analogDisplayType':
                    renderBuffer.properties.analogDisplayType = this.model.analogDisplayType;
                    break;
                case 'digitalDisplayVisible':
                    renderBuffer.properties.digitalDisplay = this.model.digitalDisplayVisible;
                    break;
                case 'digitalDisplayPosition':
                    renderBuffer.properties.digitalDisplayPosition = this.model.digitalDisplayPosition;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.analogDisplayType = this.element.analogDisplayType;
            this.model.digitalDisplayVisible = this.element.digitalDisplay;
            this.model.digitalDisplayPosition = this.element.digitalPosition;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.analogDisplayType = this.model.analogDisplayType;
            this.element.digitalDisplay = this.model.digitalDisplayVisible;
            this.element.digitalPosition = this.model.digitalDisplayPosition;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(GaugeViewModel, null, NationalInstruments.HtmlVI.Models.GaugeModel, 'jqx-gauge');
    NationalInstruments.HtmlVI.ViewModels.GaugeViewModel = GaugeViewModel;
})();
//# sourceMappingURL=niGaugeViewModel.js.map