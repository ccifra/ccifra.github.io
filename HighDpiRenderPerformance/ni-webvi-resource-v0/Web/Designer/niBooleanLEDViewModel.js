"use strict";
//****************************************
// Boolean Button View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    class BooleanLEDViewModel extends NationalInstruments.HtmlVI.ViewModels.BooleanContentControlViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('shape');
        }
        bindToView() {
            super.bindToView();
            const that = this;
            that.element.addEventListener('change', function (e) {
                if (that.computeReadOnlyForElement() || e.detail.changeType === 'api') {
                    return;
                }
                const newValue = e.detail.value;
                if (newValue !== that.model.value) {
                    that.model.controlChanged(newValue);
                }
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'trueBackground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TRUE_BACKGROUND] = this.model.trueBackground;
                    break;
                case 'trueForeground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TRUE_FOREGROUND_COLOR] = this.model.trueForeground;
                    break;
                case 'falseBackground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.FALSE_BACKGROUND] = this.model.falseBackground;
                    break;
                case 'falseForeground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.FALSE_FOREGROUND_COLOR] = this.model.falseForeground;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const style = window.getComputedStyle(this.element);
            this.model.trueBackground = style.getPropertyValue(CSS_PROPERTIES.TRUE_BACKGROUND);
            this.model.trueForeground = style.getPropertyValue(CSS_PROPERTIES.TRUE_FOREGROUND_COLOR);
            this.model.falseBackground = style.getPropertyValue(CSS_PROPERTIES.FALSE_BACKGROUND);
            this.model.falseForeground = style.getPropertyValue(CSS_PROPERTIES.FALSE_FOREGROUND_COLOR);
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.style.setProperty(CSS_PROPERTIES.TRUE_BACKGROUND, this.model.trueBackground);
            this.element.style.setProperty(CSS_PROPERTIES.TRUE_FOREGROUND_COLOR, this.model.trueForeground);
            this.element.style.setProperty(CSS_PROPERTIES.FALSE_BACKGROUND, this.model.falseBackground);
            this.element.style.setProperty(CSS_PROPERTIES.FALSE_FOREGROUND_COLOR, this.model.falseForeground);
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(BooleanLEDViewModel, null, NationalInstruments.HtmlVI.Models.BooleanLEDModel, 'jqx-led');
    NationalInstruments.HtmlVI.ViewModels.BooleanLEDViewModel = BooleanLEDViewModel;
})();
//# sourceMappingURL=niBooleanLEDViewModel.js.map