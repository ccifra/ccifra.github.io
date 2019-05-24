"use strict";
//****************************************
// Numeric TextBox View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NUM_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter;
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    class NumericTextBoxViewModel extends NationalInstruments.HtmlVI.ViewModels.NumericControlViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('spinButtonsPosition');
        }
        bindToView() {
            super.bindToView();
            const that = this;
            this.bindFocusEventListener();
            const handleChange = function (event) {
                const newValue = NUM_VAL_CONVERTER.convertBack(event.detail.value, that.model.niType);
                that._valueChanging = true;
                that.model.controlChanged(newValue);
                that._valueChanging = false;
            };
            this.element.addEventListener('change', function (event) {
                handleChange(event);
            });
            this.element.addEventListener('value-changed', function (event) {
                handleChange(event);
            });
        }
        convertNIFormatToJQX(niType, format, propertyObj) {
            const inputFormat = NUM_VAL_CONVERTER.convertNITypeToJQX(niType);
            switch (format) {
                case 'floating point':
                    propertyObj.scientificNotation = false;
                    break;
                case 'scientific':
                    propertyObj.scientificNotation = true;
                    break;
                case 'decimal':
                    propertyObj.scientificNotation = false;
                    if (inputFormat === 'integer') {
                        propertyObj.inputFormat = 'integer';
                        propertyObj.radix = 'decimal';
                    }
                    break;
                case 'hexadecimal':
                    propertyObj.radix = 'hexadecimal';
                    break;
                case 'octal':
                    propertyObj.radix = 'octal';
                    break;
                case 'binary':
                    propertyObj.radix = 'binary';
                    break;
            }
        }
        convertJQXFormatToNI(element, model) {
            if (element.inputFormat === 'integer') {
                model.format = element.radix;
            }
            else {
                model.format = element.scientificNotation ? 'scientific' : 'floating point';
            }
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'significantDigits':
                    if (this.model.significantDigits === -1) {
                        renderBuffer.properties.significantDigits = null;
                    }
                    else {
                        renderBuffer.properties.significantDigits = this.model.significantDigits;
                    }
                    break;
                case 'precisionDigits':
                    if (this.model.precisionDigits === -1) {
                        renderBuffer.properties.precisionDigits = null;
                    }
                    else {
                        renderBuffer.properties.precisionDigits = this.model.precisionDigits;
                    }
                    break;
                case 'format':
                    this.convertNIFormatToJQX(this.model.niType, this.model.format, renderBuffer.properties);
                    break;
                case 'minimum':
                    renderBuffer.properties.min = NUM_VAL_CONVERTER.convert(this.model.minimum, this.model.niType);
                    break;
                case 'maximum':
                    renderBuffer.properties.max = NUM_VAL_CONVERTER.convert(this.model.maximum, this.model.niType);
                    break;
                case 'interval':
                    renderBuffer.properties.spinButtonsStep = NUM_VAL_CONVERTER.convert(this.model.interval, this.model.niType);
                    break;
                case 'value':
                    if (!this._valueChanging) {
                        renderBuffer.properties.value = NUM_VAL_CONVERTER.convert(this.model.value, this.model.niType);
                    }
                    break;
                case 'niType':
                    // TODO - US158381 : We should handle niType changing and update 'inputFormat' / 'wordLength'
                    // on the element here.
                    // However we've turned off that code for now. Our C# code recreates the HTML control on any numeric
                    // data type change (see the calls to ReplaceHtmlView() in HtmlViewModelExtensions.cs), so handling type
                    // change here is redundant. And when we did, we hit some issues due to the fact that not all of the properties
                    // update at the same time (e.g. if we change from ComplexDouble to Int32, we'll update the element to Int32
                    // mode, even though its min and max may still be in ComplexDouble format).
                    break;
                case 'spinButtons':
                    renderBuffer.properties.spinButtons = this.model.spinButtons;
                    break;
                case 'radixVisible':
                    renderBuffer.properties.radixDisplay = this.model.radixVisible;
                    break;
                case 'popupEnabled':
                    renderBuffer.properties.dropDownEnabled = this.model.popupEnabled;
                    break;
                case 'textAlignment':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN] = this.model.textAlignment;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.niType = NUM_VAL_CONVERTER.convertJQXTypeToNI(this.element);
            this.model.value = NUM_VAL_CONVERTER.convertBack(this.element.value, this.model.niType);
            this.model.defaultValue = NUM_VAL_CONVERTER.convertBack(this.element.value, this.model.niType);
            if (this.element.min !== null) {
                this.model.minimum = NUM_VAL_CONVERTER.convertBack(this.element.min, this.model.niType);
            }
            if (this.element.max !== null) {
                this.model.maximum = NUM_VAL_CONVERTER.convertBack(this.element.max, this.model.niType);
            }
            this.model.interval = NUM_VAL_CONVERTER.convertBack(this.element.spinButtonsStep, this.model.niType);
            this.convertJQXFormatToNI(this.element, this.model);
            if (this.element.significantDigits !== null) {
                this.model.significantDigits = this.element.significantDigits;
                this.model.precisionDigits = -1;
            }
            else if (this.element.precisionDigits !== null) {
                this.model.precisionDigits = this.element.precisionDigits;
                this.model.significantDigits = -1;
            }
            this.model.spinButtons = this.element.spinButtons;
            this.model.radixVisible = this.element.radixDisplay;
            this.model.popupEnabled = this.element.dropDownEnabled;
            const style = window.getComputedStyle(this.element);
            this.model.textAlignment = style.getPropertyValue(CSS_PROPERTIES.TEXT_ALIGN);
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.value = NUM_VAL_CONVERTER.convert(this.model.value, this.model.niType);
            this.element.min = NUM_VAL_CONVERTER.convert(this.model.minimum, this.model.niType);
            this.element.max = NUM_VAL_CONVERTER.convert(this.model.maximum, this.model.niType);
            this.element.spinButtonsStep = NUM_VAL_CONVERTER.convert(this.model.interval, this.model.niType);
            this.convertNIFormatToJQX(this.model.niType, this.model.format, this.element);
            this.element.inputFormat = NUM_VAL_CONVERTER.convertNITypeToJQX(this.model.niType);
            if (this.element.inputFormat === 'integer') {
                this.element.wordLength = this.model.niType.getName().toLowerCase();
            }
            if (this.model.significantDigits >= 0) {
                this.element.significantDigits = this.model.significantDigits;
                this.element.precisionDigits = null;
            }
            else if (this.model.precisionDigits >= 0) {
                this.element.precisionDigits = this.model.precisionDigits;
                this.element.significantDigits = null;
            }
            this.element.spinButtons = this.model.spinButtons;
            this.element.radixDisplay = this.model.radixVisible;
            this.element.dropDownEnabled = this.model.popupEnabled;
            this.element.spinButtonsInitialDelay = 500;
            this.element.enableMouseWheelAction = true;
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN, this.model.textAlignment);
        }
        shouldUseTranslate() {
            return true;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(NumericTextBoxViewModel, null, NationalInstruments.HtmlVI.Models.NumericTextBoxModel, 'jqx-numeric-text-box');
    NationalInstruments.HtmlVI.ViewModels.NumericTextBoxViewModel = NumericTextBoxViewModel;
})();
//# sourceMappingURL=niNumericTextBoxViewModel.js.map