"use strict";
//****************************************
// Visual View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    const NumericControlModel = NationalInstruments.HtmlVI.Models.NumericControlModel;
    const NIComplex = window.NIComplex;
    const NumericDoubleMaxValue = Number.MAX_VALUE;
    const NumericSingleMaxValue = 3.40282347E+38;
    /**
     * Convert 64 bit integers and complex number representation from string to Number
     */
    const valueInNumberFormat = function (value, model) {
        let valueInNumberFormat = value;
        if (model.niType.is64BitInteger()) {
            valueInNumberFormat = new window.JQX.Utilities.BigNumber(value);
        }
        else if (model.niType.isComplex()) {
            valueInNumberFormat = new NIComplex(valueInNumberFormat);
        }
        return valueInNumberFormat;
    };
    /**
      * This prevents the interval from being set to less than or equal to 0 and NaN.
      */
    const canSetInterval = function (value, model) {
        if (model.niType.isComplex()) {
            if (value.realPart <= 0 || isNaN(value.realPart) || isNaN(value.imaginaryPart)) {
                return false;
            }
        }
        else if (isNaN(value) || value <= 0) {
            return false;
        }
        return true;
    };
    /**
      * Coerces positive Infinity values to the Maximum for the DataType.
      */
    const coercePositiveInfinityValue = function (value, model) {
        const intervalValueInNumberFormat = valueInNumberFormat(value, model);
        let isPositiveInfinity = false;
        if (model.niType.isComplex()) {
            if (!isFinite(intervalValueInNumberFormat.realPart) || !isFinite(intervalValueInNumberFormat.imaginaryPart)) {
                isPositiveInfinity = true;
            }
        }
        else if (!isFinite(intervalValueInNumberFormat)) {
            isPositiveInfinity = true;
        }
        if (isPositiveInfinity) {
            const type = model.getNITypeString();
            switch (type) {
                case "Double":
                    value = NumericDoubleMaxValue;
                    break;
                case "Single":
                    value = NumericSingleMaxValue;
                    break;
                case "ComplexSingle":
                    value = (new NIComplex(NumericSingleMaxValue, NumericSingleMaxValue)).toString();
                    break;
                case "ComplexDouble":
                    value = (new NIComplex(NumericDoubleMaxValue, NumericDoubleMaxValue)).toString();
                    break;
                default:
                    throw new Error("Missing data type {0}", type);
            }
        }
        return value;
    };
    const setIntervalValue = function (value, model) {
        if (canSetInterval(valueInNumberFormat(value, model), model)) {
            model.interval = coercePositiveInfinityValue(value, model);
        }
    };
    const setMaxValue = function (value, model) {
        const maxValueInNumberFormat = valueInNumberFormat(value, model);
        if (model.niType.is64BitInteger()) {
            if (maxValueInNumberFormat.compare(model.minimum) > 0) {
                model.maximum = value;
            }
        }
        else if (!isNaN(maxValueInNumberFormat) && model.minimum < maxValueInNumberFormat) {
            model.maximum = value;
        }
    };
    const setMinValue = function (value, model) {
        const minValueInNumberFormat = valueInNumberFormat(value, model);
        if (model.niType.is64BitInteger()) {
            if (minValueInNumberFormat.compare(model.maximum) < 0) {
                model.minimum = value;
            }
        }
        else if (!isNaN(minValueInNumberFormat) && model.maximum > minValueInNumberFormat) {
            model.minimum = value;
        }
    };
    class NumericControlViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        getReadOnlyPropertyName() {
            return 'readonly';
        }
        // (Note: Currently handling for Min/Max/Value/etc changes are handled in the derived viewmodels, since the properties
        //        they map to on the JQX Elements aren't identical across all of the numerics.)
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.value = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(gPropertyValue);
                    break;
                case NumericControlModel.INTERVAL_G_PROPERTY_NAME:
                    setIntervalValue(gPropertyValue, model);
                    break;
                case NumericControlModel.MAXIMUM_G_PROPERTY_NAME:
                    setMaxValue(gPropertyValue, model);
                    break;
                case NumericControlModel.MINIMUM_G_PROPERTY_NAME:
                    setMinValue(gPropertyValue, model);
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.value;
                case NumericControlModel.INTERVAL_G_PROPERTY_NAME:
                    return model.interval;
                case NumericControlModel.MAXIMUM_G_PROPERTY_NAME:
                    return model.maximum;
                case NumericControlModel.MINIMUM_G_PROPERTY_NAME:
                    return model.minimum;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.ViewModels.NumericControlViewModel = NumericControlViewModel;
})();
//# sourceMappingURL=niNumericControlViewModel.js.map