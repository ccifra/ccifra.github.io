"use strict";
//****************************************
// Visual View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NUM_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter;
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    // Static Private Functions
    const convertToScalePosition = function (scaleVisible, orientation) {
        let scalePosition = '';
        if (scaleVisible === true) {
            if (orientation === 'vertical') {
                scalePosition = 'near';
            }
            else {
                scalePosition = 'far';
            }
        }
        else {
            scalePosition = 'none';
        }
        return scalePosition;
    };
    const setScalePosition = function (model, renderBuffer) {
        renderBuffer.properties.scalePosition = convertToScalePosition(model.scaleVisible, model.orientation);
    };
    class LinearNumericPointerViewModel extends NationalInstruments.HtmlVI.ViewModels.NumericPointerViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('orientation');
        }
        bindToView() {
            super.bindToView();
            const that = this;
            const handleChange = function (event) {
                const newValue = NUM_VAL_CONVERTER.convertBack(event.detail.value, that.model.niType);
                if (that.model.value !== newValue) {
                    that.model.controlChanged(newValue);
                }
            };
            that.element.addEventListener('value-changed', function (event) {
                handleChange(event);
            });
            that.element.addEventListener('change', function (event) {
                handleChange(event);
            });
        }
        modelPropertyChanged(propertyName) {
            const that = this;
            let affectsRender = false;
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'fill':
                    renderBuffer.cssStyles[CSS_PROPERTIES.FILL] = this.model.fill;
                    break;
                case 'orientation':
                    affectsRender = true;
                    renderBuffer.properties.orientation = this.model.orientation;
                    setScalePosition(this.model, renderBuffer);
                    break;
                case 'scaleVisible':
                    // scalePosition near or none
                    affectsRender = true;
                    setScalePosition(this.model, renderBuffer);
                    break;
                case 'minimum':
                case 'maximum':
                case 'fontSize':
                case 'fontWeight':
                case 'fontStyle':
                case 'fontFamily':
                case 'textDecoration':
                case 'majorTicksVisible':
                case 'minorTicksVisible':
                case 'labelsVisible':
                case 'rangeDivisionsMode':
                case 'format':
                    // properties are set in a base class
                    affectsRender = true;
                    break;
            }
            if (affectsRender === true) {
                renderBuffer.postRender.updateSize = function () {
                    const size = that.element.getOptimalSize();
                    if (that.model.orientation === 'vertical' && size.width > parseInt(that.model.width)) {
                        that.model.sizeChanged('width', size);
                    }
                    else if (that.model.orientation === 'horizontal' && size.height > parseInt(that.model.height)) {
                        that.model.sizeChanged('height', size);
                    }
                };
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.orientation = this.element.orientation;
            const style = window.getComputedStyle(this.element);
            this.model.fill = style.getPropertyValue(CSS_PROPERTIES.FILL);
            if (this.element.scalePosition === 'none') {
                this.model.scaleVisible = false;
            }
            else {
                this.model.scaleVisible = true;
            }
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.orientation = this.model.orientation;
            this.element.scalePosition = convertToScalePosition(this.model.scaleVisible, this.model.orientation);
            this.element.style.setProperty(CSS_PROPERTIES.FILL, this.model.fill);
        }
    }
    NationalInstruments.HtmlVI.ViewModels.LinearNumericPointerViewModel = LinearNumericPointerViewModel;
})();
//# sourceMappingURL=niLinearNumericPointerViewModel.js.map