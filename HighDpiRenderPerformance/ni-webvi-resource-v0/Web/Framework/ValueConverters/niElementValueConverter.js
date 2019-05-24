"use strict";
(function () {
    'use strict';
    const NIType = window.NIType;
    const findConverterForElementName = function (elemName) {
        elemName = elemName.toLowerCase();
        switch (elemName) {
            // Numerics
            case 'jqx-numeric-text-box':
            case 'jqx-gauge':
            case 'jqx-tank':
            case 'jqx-slider':
                return NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter;
            case 'ni-ring-selector':
            case 'ni-enum-selector':
            case 'ni-radio-button-group':
                return NationalInstruments.HtmlVI.ValueConverters.NumericValueConverter;
            case 'jqx-drop-down-list':
                return NationalInstruments.HtmlVI.ValueConverters.DropDownValueConverter;
            case 'jqx-list-box':
                return NationalInstruments.HtmlVI.ValueConverters.ListBoxValueConverter;
            case 'ni-path-selector':
            case 'ni-cartesian-graph':
                return NationalInstruments.HtmlVI.ValueConverters.JsonValueConverter;
            case 'jqx-date-time-picker':
                return NationalInstruments.HtmlVI.ValueConverters.JQXDateTimeValueConverter;
            default:
                return NationalInstruments.HtmlVI.ValueConverters.ValueConverter;
        }
    };
    const getParametersForElement = function (element) {
        const elemName = element.tagName.toLowerCase();
        switch (elemName) {
            case 'jqx-numeric-text-box':
            case 'jqx-gauge':
            case 'jqx-tank':
            case 'jqx-slider':
                return NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter.convertJQXTypeToNI(element);
            case 'ni-ring-selector':
            case 'ni-enum-selector':
            case 'ni-radio-button-group':
                return new NIType(element.niType);
            case 'jqx-list-box':
                return NationalInstruments.HtmlVI.ValueConverters.ListBoxValueConverter.convertJQXToNISelectionMode(element.selectionMode);
            case 'jqx-date-time-picker':
                return element;
            default:
                return undefined;
        }
    };
    class ElementValueConverter {
        static findValueConverter(element) {
            return findConverterForElementName(element.tagName);
        }
        static getConverterParameters(element) {
            return getParametersForElement(element);
        }
        static convert(element, value) {
            const elementName = element.tagName;
            const converter = findConverterForElementName(elementName);
            return converter.convert(value, getParametersForElement(element));
        }
        static convertBack(element, value) {
            const elementName = element.tagName;
            const converter = findConverterForElementName(elementName);
            return converter.convertBack(value, getParametersForElement(element));
        }
    }
    NationalInstruments.HtmlVI.ValueConverters.ElementValueConverter = ElementValueConverter;
}());
//# sourceMappingURL=niElementValueConverter.js.map