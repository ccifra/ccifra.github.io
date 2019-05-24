"use strict";
let NITypeNames = window.NITypeNames;
/**
 * Packed data adaptor for cluster types
 */
class NIPackedClusterDataAdaptor {
    /**
     * Packs a cluster value into a flat buffer
     * @static
     * @param {flatbuffers.Builder} builder the builder to use for packing the data value
     * @param {*} dataToPack the cluster value to pack
     * @param {NIType} niType the data type of the cluster
     * @returns {number} the buffer offset of the packed cluster value
     * @memberof NIPackedClusterDataAdaptor
     */
    static PackDataValue(builder, dataToPack, niType) {
        const fields = niType.getFields();
        const subTypes = niType.getSubtype();
        const offsets = [];
        for (let x = 0; x < fields.length; ++x) {
            if (!this.packInline(subTypes[x])) {
                const offset = NationalInstruments.PackedData.NIPackedDataAdaptors.PackDataValue(builder, dataToPack[fields[x]], subTypes[x], true, x);
                offsets[x] = offset;
            }
        }
        NationalInstruments.PackedData.PackedGenericClusterValue.startPackedClusterValue(builder, fields.length);
        for (let x = 0; x < fields.length; ++x) {
            if (this.packInline(subTypes[x])) {
                NationalInstruments.PackedData.NIPackedDataAdaptors.PackDataValue(builder, dataToPack[fields[x]], subTypes[x], true, x);
            }
            else {
                builder.addFieldOffset(x, offsets[x], 0);
            }
        }
        return NationalInstruments.PackedData.PackedGenericClusterValue.endPackedClusterValue(builder);
    }
    /**
     * Determines if a type can be packed inline as a cluster field
     * @private
     * @static
     * @param {NIType} niType the type of the cluster element
     * @returns {boolean} true if the value can be packed inline as a field
     * @memberof NIPackedClusterDataAdaptor
     */
    static packInline(niType) {
        switch (niType.getName()) {
            case NITypeNames.BOOLEAN:
            case NITypeNames.UINT8:
            case NITypeNames.UINT16:
            case NITypeNames.UINT32:
            case NITypeNames.UINT64:
            case NITypeNames.INT8:
            case NITypeNames.INT16:
            case NITypeNames.INT32:
            case NITypeNames.INT64:
            case NITypeNames.SINGLE:
            case NITypeNames.DOUBLE:
            case NITypeNames.ENUM:
            case NITypeNames.INT64:
            case NITypeNames.UINT64:
                return true;
        }
        return false;
    }
    /**
     * Constructor
     * @param packedData the packed data to wrap
     * @param niType the niType of the packed data
     */
    constructor(packedData, niType, options) {
        this.packedData = packedData;
        this.niType = niType;
        this.unpackingOptions = options;
    }
    /**
     * Gets the type of this cluster as an NIType
     * @returns the NIType of the cluster
     */
    getType() {
        return this.niType;
    }
    /**
     * Unpacks this cluster into a standard JavaScript object
     * @returns The unpacked cluster
     */
    unpack() {
        const result = {};
        const fields = this.niType.getFields();
        const subTypes = this.niType.getSubtype();
        for (let x = 0; x < fields.length; ++x) {
            const value = { value: this.getUnpackedValue(x, subTypes[x]) };
            result[fields[x]] = value.value;
        }
        return result;
    }
    /**
     * Gets the unpacked value of a field in the cluster
     * @param clusterIndex the field index of the desired element
     * @param niType the niType of the field
     * @returns the unpacked value
     */
    getUnpackedValue(clusterIndex, niType) {
        switch (niType.getName()) {
            case NITypeNames.BOOLEAN:
                return this.packedData.getBooleanField(clusterIndex);
            case NITypeNames.UINT8:
                return this.packedData.getUint8Field(clusterIndex);
            case NITypeNames.UINT16:
                return this.packedData.getUint16Field(clusterIndex);
            case NITypeNames.UINT32:
                return this.packedData.getUint32Field(clusterIndex);
            case NITypeNames.UINT64:
                return this.packedData.getUint64Field(clusterIndex);
            case NITypeNames.INT8:
                return this.packedData.getInt8Field(clusterIndex);
            case NITypeNames.INT16:
                return this.packedData.getInt16Field(clusterIndex);
            case NITypeNames.INT32:
                return this.packedData.getInt32Field(clusterIndex);
            case NITypeNames.INT64:
                return this.packedData.getInt64Field(clusterIndex);
            case NITypeNames.SINGLE:
                return this.packedData.getFloat32Field(clusterIndex);
            case NITypeNames.DOUBLE:
                return this.packedData.getFloat64Field(clusterIndex);
            case NITypeNames.STRING:
                return this.packedData.getStringField(clusterIndex);
            case NITypeNames.CLUSTER:
            case NITypeNames.ARRAY:
            case NITypeNames.COMPLEXSINGLE:
            case NITypeNames.COMPLEXDOUBLE:
            case NITypeNames.TIMESTAMP:
            case NITypeNames.ANALOGWAVEFORM:
                return NationalInstruments.PackedData.NIPackedDataAdaptors.GetDataAdaptorFromIndex(this.packedData.getClusterElement(clusterIndex), niType, this.unpackingOptions).unpack();
        }
    }
}
// @ts-ignore
NationalInstruments.PackedData = NationalInstruments.PackedData || {};
NationalInstruments.PackedData.NIPackedClusterDataAdaptor = NIPackedClusterDataAdaptor;
//# sourceMappingURL=niPackedClusterDataAdaptor.js.map