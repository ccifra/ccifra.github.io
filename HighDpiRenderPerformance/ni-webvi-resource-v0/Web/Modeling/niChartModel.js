"use strict";
//****************************************
// Chart Graph Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const TypedHistoryBuffer = NationalInstruments.HtmlVI.DataPipeline.TypedHistoryBuffer;
    const EDITOR_ADAPTERS = NationalInstruments.HtmlVI.NIEditorDataAdapters;
    const NIType = window.NIType;
    // Static Private Functions
    const isHistoryBuffer = function (value) {
        return typeof value === 'object' && value.valueType === 'HistoryBuffer';
    };
    const clearHistoryIfNewWaveformIsEarlier = function (historyBuffer, arrValue) {
        const newWaveformStartsBeforeOldWaveformEnds = function (oldWaveform, newWaveform) {
            const oldTimestamp = new window.NITimestamp(oldWaveform.t0);
            const newTimestamp = new window.NITimestamp(newWaveform.t0);
            if (newTimestamp.compare(oldTimestamp.add(oldWaveform.dt * (oldWaveform.Y.length - 1))) <= 0) {
                return true;
            }
            return false;
        };
        let lastIndex, i;
        if (historyBuffer.width === 1 && !Array.isArray(arrValue)) {
            if (historyBuffer.hb.buffer.size > 0) {
                lastIndex = historyBuffer.hb.buffer.size - 1;
                if (newWaveformStartsBeforeOldWaveformEnds(historyBuffer.hb.buffer.data[lastIndex], arrValue)) {
                    historyBuffer.clear();
                }
            }
        }
        else {
            if (Array.isArray(arrValue) && arrValue.length === historyBuffer.width) {
                let clearChart = false;
                if (historyBuffer.hb.buffers.length > 0 && historyBuffer.hb.buffers[0].size > 0) {
                    for (i = 0; i < historyBuffer.width; i++) {
                        lastIndex = historyBuffer.hb.buffers[i].size - 1;
                        if (newWaveformStartsBeforeOldWaveformEnds(historyBuffer.hb.buffers[i].data[lastIndex], arrValue[i])) {
                            clearChart = true;
                            break;
                        }
                    }
                }
                for (i = 0; i < historyBuffer.width; i++) {
                    if (clearChart) {
                        historyBuffer.clear();
                    }
                }
            }
        }
    };
    const appendDataToHistoryBuffer = function (historyBuffer, arrValue) {
        if (historyBuffer.hbType === 'analogWaveform') {
            clearHistoryIfNewWaveformIsEarlier(historyBuffer, arrValue);
        }
        historyBuffer.pushTypedData(arrValue);
    };
    const transpose = function (arr) {
        const newArr = arr[0].map(function (col, i) {
            return arr.map(function (row) {
                return row[i];
            });
        });
        return newArr;
    };
    class ChartModel extends NationalInstruments.HtmlVI.Models.CartesianGraphModel {
        constructor(id) {
            super(id);
            this._historySize = 1024;
            this._bufferSize = this._historySize;
            this._value = true;
        }
        static get MODEL_KIND() {
            return 'niChart';
        }
        getOrCreateAndGetHistoryBuffer() {
            if (this._historyBuffer === undefined) {
                this._historyBuffer = new TypedHistoryBuffer(1024, 1);
                return this._historyBuffer;
            }
            return this._historyBuffer;
        }
        get historyBuffer() {
            // The ni-type property is set by the parent constructor. niChartModel is
            //overridding the ni-type and its setter depends on this historyBuffer.
            return this.getOrCreateAndGetHistoryBuffer();
        }
        get historySize() {
            return this._historySize;
        }
        set historySize(value) {
            this.historyBuffer.setCapacity(value);
            this._historySize = value;
            this.notifyModelPropertyChanged('historySize');
        }
        get bufferSize() {
            return this.historySize;
        }
        set bufferSize(value) {
            this.historySize = value;
            this.notifyModelPropertyChanged('bufferSize');
        }
        get niType() {
            return this._niType;
        }
        set niType(value) {
            let newType;
            if (value instanceof NIType) {
                newType = value;
            }
            else {
                newType = new NIType(value);
            }
            this.historyBuffer.setNIType(newType);
            this._niType = newType;
            this.notifyModelPropertyChanged('niType');
        }
        get value() {
            return undefined;
        }
        set value(value) {
            if (isHistoryBuffer(value)) {
                this.loadHistoryBufferfromJSON(this.historyBuffer, value, this.niType);
            }
            else if (typeof value === 'string') {
                const arrValue = EDITOR_ADAPTERS.editorToJsModel(JSON.parse(value), this.niType);
                appendDataToHistoryBuffer(this.historyBuffer, arrValue);
            }
            else {
                appendDataToHistoryBuffer(this.historyBuffer, value);
            }
            this.notifyModelPropertyChanged('value');
        }
        loadHistoryBufferfromJSON(historyBuffer, value, niType) {
            historyBuffer.clear();
            const rank = Array.isArray(value.data[0]) ? 2 : 1, innerType = this.getHistoryBufferInnerType(niType, rank), arrValue = EDITOR_ADAPTERS.editorToJsModel(value.data, innerType);
            if (value.size) {
                historyBuffer.setCapacity(value.size);
            }
            if (value.timingIndexes) {
                historyBuffer.indexMap =
                    value.timingIndexes.map(function (time) {
                        return (new window.NITimestamp(time).toAbsoluteTime());
                    });
            }
            else {
                historyBuffer.offset = undefined;
            }
            if (value.startIndex !== undefined) {
                historyBuffer.count = value.startIndex;
            }
            if (arrValue.length > 0) {
                if (Array.isArray(arrValue[0])) {
                    historyBuffer.setWidth(arrValue.length);
                    historyBuffer.appendArray(transpose(arrValue));
                }
                else {
                    historyBuffer.setWidth(1);
                    historyBuffer.appendArray(arrValue);
                }
            }
        }
        getHistoryBufferInnerType(niType, width) {
            // Returns an NIType describing the data inside a history buffer, based on the actual niType, and number of plots.
            let subtype = niType;
            // niType can be 2D array, or 1D array, or scalar type
            if (niType.isArray()) {
                subtype = niType.getSubtype();
            }
            // history buffer stores only values for cluster type
            if (subtype.isCluster()) {
                subtype = window.NITypes.DOUBLE;
            }
            // For a chart with a single plot, history buffer will store data as a 1D array of subtype
            // For a chart with multiple plots, history buffer will store data as a 2D array of subtype
            return subtype.makeArray((width > 1) ? 2 : 1);
        }
        modelPropertyUsesNIType(propertyName) {
            // In order to handle HistoryBuffers which are objects that include the data described by the niType
            //the information about type is took into account by this object when setting the value.
            return false;
        }
    }
    NationalInstruments.HtmlVI.Models.ChartModel = ChartModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.ChartModel);
}());
//# sourceMappingURL=niChartModel.js.map