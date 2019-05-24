'use strict';
//****************************************
// NI Numeric helpers
// National Instruments Copyright 2016
//****************************************
class NINumericsHelpers {
    static coerceSignificantDigits(sigDigits, unsetValue) {
        if (sigDigits === -1) {
            return unsetValue;
        }
        // Coerce to [1, 21], see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toPrecision
        return Math.max(1, Math.min(21, sigDigits));
    }
    static coercePrecisionDigits(precisionDigits, unsetValue) {
        if (precisionDigits === -1) {
            return unsetValue;
        }
        // Coerce to [0, 20], see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
        return Math.max(0, Math.min(20, precisionDigits));
    }
    static coerceDisplayDigits(significantDigits, precisionDigits, unsetValue) {
        const result = {};
        result.significantDigits = NINumericsHelpers.coerceSignificantDigits(significantDigits, unsetValue);
        result.precisionDigits = NINumericsHelpers.coercePrecisionDigits(precisionDigits, unsetValue);
        // sigificantDigits and precisionDigits are expected to be mutually exclusive.
        // If both are set, we prefer significantDigits (and ignore precisionDigits)
        // If neither are set, we default to 0 digits of precision.
        if (result.precisionDigits !== unsetValue && result.significantDigits !== unsetValue) {
            result.precisionDigits = unsetValue;
        }
        else if (result.precisionDigits === unsetValue && result.significantDigits === unsetValue) {
            result.precisionDigits = 0;
        }
        return result;
    }
}
// Namespace for NI Numerics
NationalInstruments.HtmlVI.NINumerics = {};
NationalInstruments.HtmlVI.NINumerics.Helpers = NINumericsHelpers;
//# sourceMappingURL=niNumerics.js.map