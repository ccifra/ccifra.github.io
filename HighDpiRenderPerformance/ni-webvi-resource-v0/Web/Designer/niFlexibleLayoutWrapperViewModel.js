"use strict";
//****************************************
// Flexible Layout Wrapper View Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    const NUM_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter;
    class FlexibleLayoutWrapperViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        modelPropertyChanged(propertyName) {
            const model = this.model;
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'flexGrow':
                    renderBuffer.cssStyles[CSS_PROPERTIES.FLEX_GROW] = NUM_VAL_CONVERTER.convert(model.flexGrow);
                    this.model.requestSendControlBounds();
                    break;
            }
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const style = window.getComputedStyle(this.element);
            this.model.flexGrow = style.getPropertyValue(CSS_PROPERTIES.FLEX_GROW);
        }
        applyModelToElement() {
            const element = this.element;
            const model = this.model;
            super.applyModelToElement();
            element.style.setProperty(CSS_PROPERTIES.FLEX_GROW, model.flexGrow);
        }
        shouldElementUseModelHeight() {
            return false;
        }
        shouldElementUseModelWidth() {
            return false;
        }
        shouldElementUseModelPosition() {
            return false;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(FlexibleLayoutWrapperViewModel, null, NationalInstruments.HtmlVI.Models.FlexibleLayoutWrapperModel, 'ni-flexible-layout-wrapper');
    NationalInstruments.HtmlVI.ViewModels.FlexibleLayoutWrapperViewModel = FlexibleLayoutWrapperViewModel;
})();
//# sourceMappingURL=niFlexibleLayoutWrapperViewModel.js.map