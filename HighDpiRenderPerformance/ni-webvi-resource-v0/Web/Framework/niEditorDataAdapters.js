'use strict';
//***************************************************************************************
// NI Editor Data Adapters
// (Conversion between JS control model formats, and what we need to send to the editor)
// Currently this just handles changing Infinity / -Infinity / NaN to a string before we
// JSON stringify it (and vice versa).
//***************************************************************************************
class NIEditorDataAdapters {
    // Input: A JavaScript number (can be Infinity/-Infinity/NaN)
    // Output: A JS number, or a string representing Infinity/-Infinity/NaN
    // private static function
    static convertJsNaNInf(val) {
        if (typeof val !== 'number') {
            throw new Error('Expected value to be number type');
        }
        if (Object.is(window.NaN, val)) {
            return 'NaN';
        }
        else if (val === Number.POSITIVE_INFINITY) {
            return 'Infinity';
        }
        else if (val === Number.NEGATIVE_INFINITY) {
            return '-Infinity';
        }
        return val;
    }
    // Input: A JS number or a string ('Infinity', '-Infinity', or 'NaN')
    // Output: A JavaScript number (can be Infinity/-Infinity/NaN)
    // private static function
    static convertNaNInfString(val) {
        if (typeof val === 'number') {
            return val;
        }
        else {
            switch (val) {
                case 'NaN':
                    return window.NaN;
                case 'Infinity':
                    return Number.POSITIVE_INFINITY;
                case '-Infinity':
                    return Number.NEGATIVE_INFINITY;
                default:
                    throw new Error('Unexpected value. Expected a JS number; or \'NaN\', \'Infinity\', or \'-Infinity\'' + '. Value: ' + val + ', type ' + (typeof val));
            }
        }
    }
    // private static function
    static convertJsFloatArray(jsValue, curRank, valueAdapter, copyData) {
        let i;
        const result = copyData ? [] : jsValue;
        if (jsValue !== undefined) {
            if (curRank === 1) {
                for (i = 0; i < jsValue.length; i++) {
                    result[i] = valueAdapter(jsValue[i]);
                }
            }
            else {
                for (i = 0; i < jsValue.length; i++) {
                    result[i] = NIEditorDataAdapters.convertJsFloatArray(jsValue[i], curRank - 1, valueAdapter, copyData);
                }
            }
        }
        return result;
    }
    // private static function
    static convertJsArray(jsValue, elementType, curRank, valueAdapter, copyData) {
        let i;
        const result = copyData ? [] : jsValue;
        if (curRank === 1) {
            for (i = 0; i < jsValue.length; i++) {
                result[i] = NIEditorDataAdapters.convert(jsValue[i], elementType, valueAdapter, copyData);
            }
        }
        else {
            for (i = 0; i < jsValue.length; i++) {
                result[i] = NIEditorDataAdapters.convertJsArray(jsValue[i], elementType, curRank - 1, valueAdapter, copyData);
            }
        }
        return result;
    }
    // private static function
    static needsConversion(niType) {
        let subtype, i, result = false;
        if (niType !== undefined) {
            if (niType.isFloat()) {
                result = true;
            }
            else if (niType.isArray()) {
                result = NIEditorDataAdapters.needsConversion(niType.getSubtype());
            }
            else if (niType.isCluster()) {
                subtype = niType.getSubtype();
                if (subtype !== undefined) {
                    for (i = 0; i < subtype.length; i++) {
                        result = result || NIEditorDataAdapters.needsConversion(subtype[i]);
                    }
                }
            }
            else if (niType.isAnalogWaveform()) {
                result = true;
            }
        }
        return result;
    }
    // private static function
    static convert(val, niType, valueAdapter, copyData) {
        let subtype, fields, field, i, result = val;
        if (niType !== undefined) {
            if (niType.isFloat()) {
                result = valueAdapter(val);
            }
            else if (niType.isArray()) {
                subtype = niType.getSubtype();
                if (Array.isArray(val)) {
                    if (subtype.isFloat()) {
                        result = NIEditorDataAdapters.convertJsFloatArray(val, niType.getRank(), valueAdapter, copyData);
                    }
                    else if (subtype.isCluster() || subtype.isAnalogWaveform()) {
                        result = NIEditorDataAdapters.convertJsArray(val, subtype, niType.getRank(), valueAdapter, copyData);
                    }
                }
            }
            else if (niType.isCluster()) {
                subtype = niType.getSubtype();
                if (subtype !== undefined) {
                    result = copyData ? {} : val;
                    fields = niType.getFields();
                    for (i = 0; i < fields.length; i++) {
                        field = fields[i];
                        if (val.hasOwnProperty(field)) {
                            result[field] = NIEditorDataAdapters.convert(val[field], subtype[i], valueAdapter, copyData);
                        }
                    }
                }
                else {
                    result = val;
                }
            }
            else if (niType.isAnalogWaveform()) {
                result = {
                    't0': '0:0',
                    'dt': 1,
                    'channelName': '',
                    'Y': []
                };
                if (val !== null) {
                    result.dt = val.dt;
                    result.t0 = val.t0;
                    result.channelName = val.channelName;
                    result.Y = NIEditorDataAdapters.convertJsFloatArray(val.Y, 1, valueAdapter, copyData);
                }
            }
        }
        return result;
    }
    static jsModelToEditor(jsValue, niType) {
        if (!NIEditorDataAdapters.needsConversion(niType)) {
            return jsValue;
        }
        // copyData = true here because if we're going to switch out NaN/Inf/-Inf to 'Infinity'/'-Infinity'/'NaN'
        // we can't do that in-place (on an array or cluster), since we'd be affecting the model (and element's) value,
        // which should use the real NaN/Inf/-Inf.
        return NIEditorDataAdapters.convert(jsValue, niType, NIEditorDataAdapters.convertJsNaNInf, true);
    }
    static editorToJsModel(editorValue, niType) {
        if (!NIEditorDataAdapters.needsConversion(niType)) {
            return editorValue;
        }
        // copyData = false here because we're assuming that editorToJsModel is always called with a value object that was just created from a JSON.parse,
        // since this is an update message coming from the editor. So, creating another copy of the data is unnecessary.
        return NIEditorDataAdapters.convert(editorValue, niType, NIEditorDataAdapters.convertNaNInfString, false);
    }
    static packedDataToJsModel(flatData, niType, options) {
        let result;
        if (flatData instanceof Uint8Array) {
            result = NationalInstruments.PackedData.NIPackedDataAdaptors.GetDataAdaptorFromPackedValue(flatData, niType, options);
        }
        else {
            result = NationalInstruments.PackedData.NIPackedDataAdaptors.GetDataAdaptorFromIndex(flatData, niType, options);
        }
        if (options === undefined || options.supportsVirtualization === undefined || options.supportsVirtualization !== true) {
            return result.unpack();
        }
        return result;
    }
}
NationalInstruments.HtmlVI.NIEditorDataAdapters = NIEditorDataAdapters;
//# sourceMappingURL=niEditorDataAdapters.js.map