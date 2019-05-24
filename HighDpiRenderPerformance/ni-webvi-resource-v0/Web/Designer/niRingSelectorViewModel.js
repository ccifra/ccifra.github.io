"use strict";
//****************************************
// RingSelector View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    const TEXTALIGN_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.TextAlignmentValueConverter;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const RingSelectorModel = NationalInstruments.HtmlVI.Models.RingSelectorModel;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    // Static Private Variables
    const numericValueWidthCssVariable = '--ni-numeric-value-width';
    // Static Private Functions
    const validateSelectors = function (itemsAndValuesMap) {
        const displayNameValues = [];
        const values = [];
        for (let i = 0; i < itemsAndValuesMap.length; i++) {
            displayNameValues[i] = itemsAndValuesMap[i].String;
            values[i] = itemsAndValuesMap[i].Value;
            if (displayNameValues[i] === "") {
                throw new Error(NI_SUPPORT.i18n('msg_EMPTY_DISPLAY_VALUE'));
            }
        }
        if (displayNameValues.length !== new Set(displayNameValues).size) {
            throw new Error(NI_SUPPORT.i18n('msg_DUPLICATE_DISPLAY_NAME'));
        }
        if (values.length !== new Set(values).size) {
            throw new Error(NI_SUPPORT.i18n('msg_DUPLICATE_DISPLAY_VALUE'));
        }
    };
    class RingSelectorViewModel extends NationalInstruments.HtmlVI.ViewModels.NumericValueSelectorViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('allowUndefined');
        }
        bindToView() {
            super.bindToView();
            this.bindFocusEventListener();
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'textAlignment':
                    // TextAlignmentCssVariable is for drop down container whereas flexAlignmentCssVariable is for flex container inside drop down.
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN_AS_FLEX] = TEXTALIGN_VAL_CONVERTER.convertTextAlignmentToFlexAlignment(this.model.textAlignment);
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN] = this.model.textAlignment;
                    break;
                case 'numericValueWidth':
                    renderBuffer.cssStyles[numericValueWidthCssVariable] = this.model.numericValueWidth + "px";
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const elementStyle = window.getComputedStyle(this.element);
            this.model.textAlignment = elementStyle.getPropertyValue(CSS_PROPERTIES.TEXT_ALIGN);
            this.model.numericValueWidth = parseFloat(elementStyle.getPropertyValue(numericValueWidthCssVariable));
        }
        applyModelToElement() {
            super.applyModelToElement();
            const justifyContent = TEXTALIGN_VAL_CONVERTER.convertTextAlignmentToFlexAlignment(this.model.textAlignment);
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN_AS_FLEX, justifyContent);
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN, this.model.textAlignment);
            this.element.style.setProperty(numericValueWidthCssVariable, this.model.numericValueWidth + "px");
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case RingSelectorModel.ITEMS_AND_VALUES_G_PROPERTY_NAME:
                    return model.items.map((item) => {
                        const valueAndDisplayValue = {};
                        valueAndDisplayValue.String = item.displayValue;
                        valueAndDisplayValue.Value = item.value;
                        return valueAndDisplayValue;
                    });
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.value = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(gPropertyValue);
                    break;
                case RingSelectorModel.ITEMS_AND_VALUES_G_PROPERTY_NAME:
                    validateSelectors(gPropertyValue);
                    model.items = gPropertyValue.map((item) => {
                        const valueAndDisplayValue = {};
                        valueAndDisplayValue.displayValue = item.String;
                        valueAndDisplayValue.value = item.Value;
                        return valueAndDisplayValue;
                    });
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(RingSelectorViewModel, NationalInstruments.HtmlVI.Elements.RingSelector, NationalInstruments.HtmlVI.Models.RingSelectorModel);
    NationalInstruments.HtmlVI.ViewModels.RingSelectorViewModel = RingSelectorViewModel;
})();
//# sourceMappingURL=niRingSelectorViewModel.js.map