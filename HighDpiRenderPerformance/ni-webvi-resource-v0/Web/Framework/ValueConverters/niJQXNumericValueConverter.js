"use strict";
(function () {
    'use strict';
    const NIType = window.NIType;
    const NITypes = window.NITypes;
    class JQXNumericValueConverter {
        static convertNITypeToJQX(niType) {
            if (niType.isComplex()) {
                return 'complex';
            }
            if (niType.isFloat()) {
                return 'floatingPoint';
            }
            return 'integer';
        }
        static convertJQXTypeToNI(element) {
            let niType, valueType;
            if (element.inputFormat === 'integer' || element.scaleType === 'integer') {
                valueType = element.wordLength.replace(/(u?i)/, function (match) {
                    return match.toUpperCase();
                });
                niType = new NIType(JSON.stringify(valueType));
            }
            else if (element.inputFormat === 'floatingPoint' || element.scaleType === 'floatingPoint') {
                niType = NITypes.DOUBLE;
            }
            else {
                niType = NITypes.COMPLEXDOUBLE;
            }
            return niType;
        }
        // jqx value is always string
        static convert(value, niType) {
            return value.toString();
        }
        static convertBack(value, niType) {
            if (niType === undefined || (niType.isInteger() && niType.is64BitInteger() === false)) {
                return parseInt(value);
            }
            else if (niType.isFloat()) {
                return parseFloat(value);
            }
            else if (niType.is64BitInteger() || niType.isComplex()) {
                return value.toString();
            }
            return value.toString();
        }
    }
    NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter = JQXNumericValueConverter;
}());
//# sourceMappingURL=niJQXNumericValueConverter.js.map