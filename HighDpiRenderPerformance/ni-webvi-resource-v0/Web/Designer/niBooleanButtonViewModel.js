"use strict";
//****************************************
// Boolean Button View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    // Static Private Functions
    const setBorderColor = function (color, renderBuffer) {
        // Border in button supports both solid color as well as linear-gradient color.
        // We need to use border-image and border-color as different properties because,
        // there is no shorthand property for them in CSS.
        // We should change border-image to none/initial/unset when we want to set border-color
        // because border-image takes precedence over border-color and setting border-image
        // to none makes it fallback on border-color.
        let borderColorValue, borderImageValue;
        if (color.indexOf('gradient') >= 0) {
            borderImageValue = color;
            borderColorValue = 'unset';
        }
        else {
            borderColorValue = color;
            borderImageValue = 'unset';
        }
        renderBuffer.cssStyles[CSS_PROPERTIES.BORDER_COLOR] = borderColorValue;
        renderBuffer.cssStyles[CSS_PROPERTIES.BORDER_GRADIENT] = borderImageValue;
    };
    class BooleanButtonViewModel extends NationalInstruments.HtmlVI.ViewModels.BooleanControlViewModel {
        bindToView() {
            super.bindToView();
            const that = this;
            that.element.addEventListener('change', function (e) {
                if (that.computeReadOnlyForElement() || e.detail.changeType === 'api') {
                    return;
                }
                const newValue = e.detail.value;
                if (that.model.value !== newValue) {
                    that.model.controlChanged(newValue);
                }
            });
        }
        modelPropertyChanged(propertyName) {
            const model = this.model;
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'content':
                    renderBuffer.properties.content = model.content;
                    break;
                case 'value':
                    renderBuffer.properties.checked = model.value;
                    break;
                case 'trueBackground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TRUE_BACKGROUND] = model.trueBackground;
                    break;
                case 'trueForeground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TRUE_FOREGROUND_COLOR] = model.trueForeground;
                    break;
                case 'falseBackground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.FALSE_BACKGROUND] = model.falseBackground;
                    break;
                case 'falseForeground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.FALSE_FOREGROUND_COLOR] = model.falseForeground;
                    break;
                case 'borderColor':
                    setBorderColor(model.borderColor, renderBuffer);
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            const model = this.model;
            const element = this.element;
            super.updateModelFromElement();
            const childElement = element.firstElementChild;
            const contentSpan = childElement.querySelector('.ni-text');
            if (contentSpan !== null) {
                this.model.contentVisible = contentSpan.classList.contains('ni-hidden') !== true;
            }
            model.value = element.value;
            const elementStyle = window.getComputedStyle(element);
            model.content = contentSpan.textContent;
            model.trueBackground = elementStyle.getPropertyValue(CSS_PROPERTIES.TRUE_BACKGROUND);
            model.trueForeground = elementStyle.getPropertyValue(CSS_PROPERTIES.TRUE_FOREGROUND_COLOR);
            model.falseBackground = elementStyle.getPropertyValue(CSS_PROPERTIES.FALSE_BACKGROUND);
            model.falseForeground = elementStyle.getPropertyValue(CSS_PROPERTIES.FALSE_FOREGROUND_COLOR);
            let borderColor = elementStyle.getPropertyValue(CSS_PROPERTIES.BORDER_GRADIENT);
            if (borderColor.indexOf('gradient') === -1) {
                borderColor = elementStyle.getPropertyValue(CSS_PROPERTIES.BORDER_COLOR);
            }
            model.borderColor = borderColor;
        }
        applyModelToElement() {
            const model = this.model;
            const element = this.element;
            super.applyModelToElement();
            element.content = model.content;
            element.checked = model.value;
            element.style.setProperty(CSS_PROPERTIES.TRUE_BACKGROUND, model.trueBackground);
            element.style.setProperty(CSS_PROPERTIES.TRUE_FOREGROUND_COLOR, model.trueForeground);
            element.style.setProperty(CSS_PROPERTIES.FALSE_BACKGROUND, model.falseBackground);
            element.style.setProperty(CSS_PROPERTIES.FALSE_FOREGROUND_COLOR, model.falseForeground);
            const borderColor = model.borderColor;
            if (borderColor.indexOf('gradient') >= 0) {
                element.style.setProperty(CSS_PROPERTIES.BORDER_GRADIENT, borderColor);
            }
            else {
                element.style.setProperty(CSS_PROPERTIES.BORDER_COLOR, borderColor);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(BooleanButtonViewModel, null, NationalInstruments.HtmlVI.Models.BooleanButtonModel, 'jqx-toggle-button');
    NationalInstruments.HtmlVI.ViewModels.BooleanButtonViewModel = BooleanButtonViewModel;
})();
//# sourceMappingURL=niBooleanButtonViewModel.js.map