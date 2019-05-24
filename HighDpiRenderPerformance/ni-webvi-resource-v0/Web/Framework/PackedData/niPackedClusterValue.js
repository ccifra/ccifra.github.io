"use strict";
/**
 * A cluster whose value is stored in a flatbuffer
 */
class PackedGenericClusterValue {
    /**
     * Gets a cluster as the root object of a byte buffer
     * @param bb the byte buffer containing the packed data
     */
    static getRootAsPackedCluster(bb) {
        return new PackedGenericClusterValue(bb.readInt32(bb.position()) + bb.position(), bb);
    }
    /**
     * Starts the build of a cluster in a flat buffer
     * @static
     * @param {flatbuffers.Builder} builder the builder used for packing
     * @param {number} numFields the number of fields in the cluster
     * @memberof PackedGenericClusterValue
     */
    static startPackedClusterValue(builder, numFields) {
        builder.startObject(numFields);
    }
    /**
     * Completes the build of a cluser value
     * @static
     * @param {flatbuffers.Builder} builder the builder used for packing the cluster
     * @returns {number} the buffer offset of the packed cluster
     * @memberof PackedGenericClusterValue
     */
    static endPackedClusterValue(builder) {
        return builder.endObject();
    }
    /**
     * constructor - used when a cluster contained as a part of a byte buffer
     * @param index the byte buffer index / offset of this cluster vale
     * @param bb the byte buffer containing the packed data
     */
    constructor(index, bb) {
        this.index = index;
        this.bb = bb;
    }
    getUint8Field(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.readUint8(this.index + offset) : 0.0;
    }
    /**
     * Gets an Int8 cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getInt8Field(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.readInt8(this.index + offset) : 0.0;
    }
    /**
     * Gets an UInt16 cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getUint16Field(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.readUint16(this.index + offset) : 0.0;
    }
    /**
     * Gets an Int16 cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getInt16Field(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.readInt16(this.index + offset) : 0.0;
    }
    /**
     * Gets an UInt32 cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getUint32Field(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.readUint32(this.index + offset) : 0.0;
    }
    /**
     * Gets an Int32 cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getInt32Field(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.readInt32(this.index + offset) : 0.0;
    }
    /**
     * Gets an Float32 cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getFloat32Field(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.readFloat32(this.index + offset) : 0.0;
    }
    /**
     * Gets an float64 cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getFloat64Field(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.readFloat64(this.index + offset) : 0.0;
    }
    /**
     * Gets an Boolean cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getBooleanField(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? !!this.bb.readInt8(this.index + offset) : false;
    }
    /**
     * Gets an string cluster field value by cluster index
     * @param clusterIndex the cluster field index
     */
    getStringField(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (2 * clusterIndex));
        return offset ? this.bb.__string(this.index + offset) : "";
    }
    /**
     * Gets a cluster field value by cluster index as a packed data value
     * This is used when a cluster field's value is stored by reference and not as an inlined value
     * @param clusterIndex the cluster field index of the desired element
     * @returns the cluster element as a PackedDataValue
     */
    getClusterElement(clusterIndex) {
        const offset = this.bb.__offset(this.index, 4 + (clusterIndex * 2));
        if (offset !== 0) {
            const result = new NationalInstruments.PackedData.PackedDataValue();
            result.__init(this.bb.__indirect(this.index + offset), this.bb);
            return result;
        }
        return undefined;
    }
}
// @ts-ignore
NationalInstruments.PackedData = NationalInstruments.PackedData || {};
NationalInstruments.PackedData.PackedGenericClusterValue = PackedGenericClusterValue;
//# sourceMappingURL=niPackedClusterValue.js.map