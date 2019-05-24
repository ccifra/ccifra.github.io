"use strict";
/**
 * Helper class to get a data adaptor for flattend data given the niType of the data
 */
class NIPackedDataAdaptors {
    /**
     * Packs an object into a shared memory packed data value
     * @static
     * @param {any} dataToPack data value to pack
     * @param {NIType} niType NIType of the object to pack
     * @returns {string} shared memory ID of the buffer which holds the packed value
     * @memberof NIPackedDataAdaptors
     */
    static PackDataIntoSharedMemory(dataToPack, niType) {
        const packedData = NationalInstruments.PackedData.NIPackedDataAdaptors.PackData(dataToPack, niType);
        const transferBuffer = browserMessaging.getSharedData("", packedData.length);
        new Uint8Array(transferBuffer).set(packedData);
        return browserMessaging.getSharedDataId(transferBuffer);
    }
    /**
     * Packs an object into a packed data value
     * @static
     * @param {any} dataToPack data value to pack
     * @param {NIType} niType NIType of the object to pack
     * @returns {Uint8Array} Buffer containing the packed data value
     * @memberof NIPackedDataAdaptors
     */
    static PackData(dataToPack, niType) {
        const builder = new flatbuffers.Builder(1024);
        const dataOffset = NIPackedDataAdaptors.PackDataValue(builder, dataToPack, niType, false, 0);
        if (dataOffset !== 0) {
            NationalInstruments.PackedData.PackedDataValue.startPackedDataValue(builder);
            NationalInstruments.PackedData.PackedDataValue.addValue(builder, dataOffset);
            const dataValue = NationalInstruments.PackedData.PackedDataValue.endPackedDataValue(builder);
            builder.finish(dataValue);
            return builder.asUint8Array();
        }
    }
    /**
     * Packs a single value using the provided flat buffer builder
     * @static
     * @param {flatbuffers.Builder} builder the builder to use to pack the data value
     * @param {*} dataToPack the value to pack
     * @param {NIType} niType the NIType of the data value
     * @param {boolean} packInline true to pack the value inline as a field if possible
     * @param {number} fieldOffset the field offset of the inlined packed value
     * @returns {number} flat buffer offset of the data value if it was not packed inline
     * @memberof NIPackedDataAdaptors
     */
    static PackDataValue(builder, dataToPack, niType, packInline, fieldOffset) {
        let dataOffset = 0;
        switch (niType.getName()) {
            case NITypeNames.BOOLEAN:
                if (packInline) {
                    builder.addFieldInt8(fieldOffset, +dataToPack, +false);
                }
                else {
                    NationalInstruments.PackedData.PackedBooleanValue.startPackedBooleanValue(builder);
                    NationalInstruments.PackedData.PackedBooleanValue.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedBooleanValue.endPackedBooleanValue(builder);
                }
                break;
            case NITypeNames.UINT8:
                if (packInline) {
                    builder.addFieldInt8(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedUInt8Value.startPackedUInt8Value(builder);
                    NationalInstruments.PackedData.PackedUInt8Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedUInt8Value.endPackedUInt8Value(builder);
                }
                break;
            case NITypeNames.UINT16:
                if (packInline) {
                    builder.addFieldInt16(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedUInt16Value.startPackedUInt16Value(builder);
                    NationalInstruments.PackedData.PackedUInt16Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedUInt16Value.endPackedUInt16Value(builder);
                }
                break;
            case NITypeNames.UINT32:
                if (packInline) {
                    builder.addFieldInt32(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedUInt32Value.startPackedUInt32Value(builder);
                    NationalInstruments.PackedData.PackedUInt32Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedUInt32Value.endPackedUInt32Value(builder);
                }
                break;
            case NITypeNames.UINT64:
                if (packInline) {
                    builder.addFieldInt64(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedUInt64Value.startPackedUInt64Value(builder);
                    NationalInstruments.PackedData.PackedUInt64Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedUInt64Value.endPackedUInt64Value(builder);
                }
                break;
            case NITypeNames.INT8:
                if (packInline) {
                    builder.addFieldInt8(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedInt8Value.startPackedInt8Value(builder);
                    NationalInstruments.PackedData.PackedInt8Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedInt8Value.endPackedInt8Value(builder);
                }
                break;
            case NITypeNames.INT16:
                if (packInline) {
                    builder.addFieldInt16(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedInt16Value.startPackedInt16Value(builder);
                    NationalInstruments.PackedData.PackedInt16Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedInt16Value.endPackedInt16Value(builder);
                }
                break;
            case NITypeNames.INT32:
                if (packInline) {
                    builder.addFieldInt32(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedInt32Value.startPackedInt32Value(builder);
                    NationalInstruments.PackedData.PackedInt32Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedInt32Value.endPackedInt32Value(builder);
                }
                break;
            case NITypeNames.INT64:
                if (packInline) {
                    builder.addFieldInt64(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedInt64Value.startPackedInt64Value(builder);
                    NationalInstruments.PackedData.PackedInt64Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedInt64Value.endPackedInt64Value(builder);
                }
                break;
            case NITypeNames.SINGLE:
                if (packInline) {
                    builder.addFieldFloat32(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedFloat32Value.startPackedFloat32Value(builder);
                    NationalInstruments.PackedData.PackedFloat32Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedFloat32Value.endPackedFloat32Value(builder);
                }
                break;
            case NITypeNames.DOUBLE:
                if (packInline) {
                    builder.addFieldFloat64(fieldOffset, dataToPack, 0);
                }
                else {
                    NationalInstruments.PackedData.PackedFloat64Value.startPackedFloat64Value(builder);
                    NationalInstruments.PackedData.PackedFloat64Value.addValue(builder, dataToPack);
                    dataOffset = NationalInstruments.PackedData.PackedFloat64Value.endPackedFloat64Value(builder);
                }
                break;
            case NITypeNames.STRING:
                const stringOffset = builder.createString(dataToPack);
                if (packInline) {
                    dataOffset = stringOffset;
                }
                else {
                    NationalInstruments.PackedData.PackedStringValue.startPackedStringValue(builder);
                    NationalInstruments.PackedData.PackedStringValue.addValue(builder, stringOffset);
                    dataOffset = NationalInstruments.PackedData.PackedStringValue.endPackedStringValue(builder);
                }
                break;
            case NITypeNames.ARRAY:
                dataOffset = NationalInstruments.PackedData.NIPackedArrayDataAdaptor.PackDataValue(builder, dataToPack, niType);
                break;
            case NITypeNames.CLUSTER:
                dataOffset = NationalInstruments.PackedData.NIPackedClusterDataAdaptor.PackDataValue(builder, dataToPack, niType);
                break;
            case NITypeNames.COMPLEXSINGLE:
                dataOffset = NationalInstruments.PackedData.NIPackedComplexSingleAdaptor.PackDataValue(builder, dataToPack, niType);
                break;
            case NITypeNames.COMPLEXDOUBLE:
                dataOffset = NationalInstruments.PackedData.NIPackedComplexDoubleAdaptor.PackDataValue(builder, dataToPack, niType);
                break;
            case NITypeNames.TIMESTAMP:
                dataOffset = NationalInstruments.PackedData.NIPackedTimestampAdaptor.PackDataValue(builder, dataToPack);
                break;
            case NITypeNames.ANALOGWAVEFORM:
                dataOffset = NationalInstruments.PackedData.NIPackedWaveformAdaptor.PackDataValue(builder, dataToPack, niType);
                break;
        }
        return dataOffset;
    }
    /**
     * Gets a data adaptor for the root object in the packed data
     * @param packedData the array containing the packed data
     * @param niType The NIType of the packed data
     * @returns INIPackedDataAdaptor for the root object in the packed data
     */
    static GetDataAdaptorFromRoot(packedData, niType, options) {
        const buffer = new flatbuffers.ByteBuffer(packedData);
        switch (niType.getName()) {
            case NITypeNames.BOOLEAN:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedBooleanValue.getRootAsPackedBooleanValue(buffer), niType, options);
            case NITypeNames.UINT8:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedUInt8Value.getRootAsPackedUInt8Value(buffer), niType, options);
            case NITypeNames.UINT16:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedUInt16Value.getRootAsPackedUInt16Value(buffer), niType, options);
            case NITypeNames.UINT32:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedUInt32Value.getRootAsPackedUInt32Value(buffer), niType, niType, options);
            case NITypeNames.UINT64:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedUInt64Value.getRootAsPackedUInt64Value(buffer), niType, niType, options);
            case NITypeNames.INT8:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedInt8Value.getRootAsPackedInt8Value(buffer), niType, options);
            case NITypeNames.INT16:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedInt16Value.getRootAsPackedInt16Value(buffer), niType, options);
            case NITypeNames.INT32:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedInt32Value.getRootAsPackedInt32Value(buffer), niType, options);
            case NITypeNames.INT64:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedInt64Value.getRootAsPackedInt64Value(buffer), niType, options);
            case NITypeNames.SINGLE:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedFloat32Value.getRootAsPackedFloat32Value(buffer), niType, options);
            case NITypeNames.DOUBLE:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedFloat64Value.getRootAsPackedFloat64Value(buffer), niType, options);
            case NITypeNames.STRING:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(NationalInstruments.PackedData.PackedStringValue.getRootAsPackedStringValue(buffer), niType, options);
            case NITypeNames.CLUSTER:
                return new NationalInstruments.PackedData.NIPackedClusterDataAdaptor(NationalInstruments.PackedData.PackedGenericClusterValue.getRootAsPackedCluster(buffer), niType, options);
            case NITypeNames.ARRAY:
                return new NationalInstruments.PackedData.NIPackedArrayDataAdaptor(NationalInstruments.PackedData.PackedArrayValue.getRootAsPackedArrayValue(buffer), niType, options);
            case NITypeNames.COMPLEXSINGLE:
                return new NationalInstruments.PackedData.NIPackedComplexSingleAdaptor(NationalInstruments.PackedData.PackedComplexFloat32Value.getRootAsPackedComplexFloat32Value(buffer), niType, options);
            case NITypeNames.COMPLEXDOUBLE:
                return new NationalInstruments.PackedData.NIPackedComplexDoubleAdaptor(NationalInstruments.PackedData.PackedComplexFloat64Value.getRootAsPackedComplexFloat64Value(buffer), niType, options);
            case NITypeNames.TIMESTAMP:
                return new NationalInstruments.PackedData.NIPackedTimestampAdaptor(NationalInstruments.PackedData.PackedTimestampValue.getRootAsPackedTimestampValue(buffer), niType, options);
            case NITypeNames.ANALOGWAVEFORM:
                return new NationalInstruments.PackedData.NIPackedWaveformAdaptor(NationalInstruments.PackedData.PackedWaveformValue.getRootAsPackedWaveformValue(buffer), niType, options);
        }
        return undefined;
    }
    /**
     * Gets a data adaptor from the provided packedData and niType
     * @param packedData the array containing the packed data
     * @param niType The NIType of the packed data
     * @returns INIPackedDataAdaptor for the root object in the packed data
     */
    static GetDataAdaptorFromPackedValue(packedData, niType, options) {
        const buffer = new flatbuffers.ByteBuffer(packedData);
        const packedDataValue = NationalInstruments.PackedData.PackedDataValue.getRootAsPackedDataValue(buffer);
        return this.GetDataAdaptorFromIndex(packedDataValue.value({}), niType, options);
    }
    /**
     * Gets a type specific data adaptor from a data element buffer reference
     * @param dataElement The packed data value to get a data adaptor for
     * @param niType The NIType of the data
     * @returns The data adaptor for the packed data
     */
    static GetDataAdaptorFromIndex(dataElement, niType, options) {
        switch (niType.getName()) {
            case NITypeNames.BOOLEAN:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedBooleanValue().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.UINT8:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedUInt8Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.UINT16:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedUInt16Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.UINT32:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedUInt32Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.UINT64:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedUInt64Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.INT8:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedInt8Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.INT16:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedInt16Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.INT32:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedInt32Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.INT64:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedInt64Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.SINGLE:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedFloat32Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.DOUBLE:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedFloat64Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.STRING:
                return new NationalInstruments.PackedData.NIPackedValueAdaptor(new NationalInstruments.PackedData.PackedStringValue().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.CLUSTER:
                return new NationalInstruments.PackedData.NIPackedClusterDataAdaptor(new NationalInstruments.PackedData.PackedGenericClusterValue(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.ARRAY:
                return new NationalInstruments.PackedData.NIPackedArrayDataAdaptor(new NationalInstruments.PackedData.PackedArrayValue().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.COMPLEXSINGLE:
                return new NationalInstruments.PackedData.NIPackedComplexSingleAdaptor(new NationalInstruments.PackedData.PackedComplexFloat32Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.COMPLEXDOUBLE:
                return new NationalInstruments.PackedData.NIPackedComplexDoubleAdaptor(new NationalInstruments.PackedData.PackedComplexFloat64Value().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.TIMESTAMP:
                return new NationalInstruments.PackedData.NIPackedTimestampAdaptor(new NationalInstruments.PackedData.PackedTimestampValue().__init(dataElement.bb_pos, dataElement.bb), niType, options);
            case NITypeNames.ANALOGWAVEFORM:
                return new NationalInstruments.PackedData.NIPackedWaveformAdaptor(new NationalInstruments.PackedData.PackedWaveformValue().__init(dataElement.bb_pos, dataElement.bb), niType, options);
        }
        return undefined;
    }
}
// @ts-ignore
NationalInstruments.PackedData = NationalInstruments.PackedData || {};
NationalInstruments.PackedData.NIPackedDataAdaptors = NIPackedDataAdaptors;
//# sourceMappingURL=niPackedDataAdaptors.js.map