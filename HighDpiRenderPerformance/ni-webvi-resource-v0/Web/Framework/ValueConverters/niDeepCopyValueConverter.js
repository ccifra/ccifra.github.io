"use strict";
(function () {
    'use strict';
    const isObjectOfNamedProperties = function (value) {
        return Array.isArray(value) === false && typeof value === 'object' && value !== null;
    };
    class DeepCopyConverter {
        static deepCopy(value) {
            let i;
            if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
                return value;
            }
            else if (value === null || value === undefined) {
                return value;
            }
            else if (Array.isArray(value)) {
                const newValue1 = [];
                for (i = 0; i < value.length; i++) {
                    newValue1[i] = DeepCopyConverter.deepCopy(value[i]);
                }
                return newValue1;
            }
            else if (isObjectOfNamedProperties(value)) {
                const newValue2 = {};
                let x;
                for (x in value) {
                    if (value.hasOwnProperty(x)) {
                        newValue2[x] = DeepCopyConverter.deepCopy(value[x]);
                    }
                }
                return newValue2;
            }
            else {
                throw new Error('Unsupported type');
            }
        }
        static isDeepEqual(currVal, newVal) {
            let i, currentIterationEqual;
            let x, y, currValSize, newValSize;
            if (typeof currVal === 'number' || typeof currVal === 'string' || typeof currVal === 'boolean') {
                return currVal === newVal;
            }
            else if (currVal === null || currVal === undefined) {
                return currVal === newVal;
            }
            else if (Array.isArray(currVal)) {
                if (Array.isArray(newVal) === false) {
                    return false;
                }
                if (currVal.length !== newVal.length) {
                    return false;
                }
                for (i = 0; i < currVal.length; i++) {
                    currentIterationEqual = DeepCopyConverter.isDeepEqual(currVal[i], newVal[i]);
                    if (currentIterationEqual === false) {
                        return false;
                    }
                }
                return true;
            }
            else if (isObjectOfNamedProperties(currVal)) {
                if (isObjectOfNamedProperties(newVal) === false) {
                    return false;
                }
                currValSize = 0;
                for (x in currVal) {
                    if (currVal.hasOwnProperty(x)) {
                        if (newVal.hasOwnProperty(x) === false) {
                            return false;
                        }
                        currentIterationEqual = DeepCopyConverter.isDeepEqual(currVal[x], newVal[x]);
                        if (currentIterationEqual === false) {
                            return false;
                        }
                        currValSize++;
                    }
                }
                newValSize = 0;
                for (y in newVal) {
                    if (newVal.hasOwnProperty(y)) {
                        newValSize++;
                    }
                }
                return currValSize === newValSize;
            }
            else {
                throw new Error('Unsupported type');
            }
        }
    }
    NationalInstruments.HtmlVI.ValueConverters.DeepCopyValueConverter = DeepCopyConverter;
}());
//# sourceMappingURL=niDeepCopyValueConverter.js.map