"use strict";
/**
 * Nipacked array data adaptor
 * Adaptor for generic packed arrays whose type of specificed by a provided NIType
 * Provides virtualization support and unpacking to a javascript object
 */
class NIPackedArrayDataAdaptor {
    /**
     * Packs an array value into a flat buffer
     * @static
     * @param {flatbuffers.Builder} builder the builder to use for packing the data value
     * @param {*} dataToPack the array value to pack
     * @param {NIType} niType the data type of the array
     * @returns {number} the buffer offset of the packed array value
     * @memberof NIPackedArrayDataAdaptor
     */
    static PackDataValue(builder, dataToPack, niType) {
        const packer = new NIArrayPacker(builder, dataToPack, niType);
        return packer.pack();
    }
    /**
     * Creates an instance of nipacked array data adaptor.
     * @param packedData the packed data to wrap
     * @param niType The type ofthe packed data
     */
    constructor(packedData, niType, options) {
        this.niType = niType;
        this.unpacker = new NIArrayUnpacker(packedData, niType, options);
    }
    /**
     * Gets the type of this array as an NIType
     * @returns The NIType
     */
    getType() {
        return this.niType;
    }
    /**
     * Unpacks this array into a standard JavaScript object
     * @returns the unpacked JS object
     */
    unpack() {
        return this.unpacker.unpack();
    }
}
/**
 * Helper class for unpacking a packed array
 */
class NIArrayUnpacker {
    /**
     * Creates an instance of nipacked array data adaptor.
     * @param packedData the packed data to wrap
     * @param niType The type ofthe packed data
     */
    constructor(packedData, niType, options) {
        this.packedData = packedData;
        this.niType = niType;
        this.unpackingOptions = options;
    }
    /**
     * Gets type  Gets the type of this array as an NIType
     * @returns The NIType
     */
    getType() {
        return this.niType;
    }
    /**
     * Unpacks this array into a standard JavaScript object
     * @returns the unpacked JS object
     */
    unpack() {
        if (NITypeUtils.isBlittableArrayType(this.niType)) {
            return this.unpackBlittableType();
        }
        return this.unpackObjectArray();
    }
    /**
     * Unpacks this array as an array of objects
     * This is used when the array contains a non blitteable type
     * @returns the unpacked array as JS array of objects
     */
    unpackObjectArray() {
        // TODO: add multi-dimension support
        const result = [];
        const subType = this.niType.getSubtype();
        for (let x = 0; x < this.packedData.valueLength(); ++x) {
            const dataValue = this.packedData.value(x);
            const element = NationalInstruments.PackedData.NIPackedDataAdaptors.GetDataAdaptorFromIndex(dataValue, subType, this.unpackingOptions);
            result[x] = element.unpack();
        }
        return result;
    }
    /**
     * Unpacks this array as a type array (array(s) of type array)
     * This is used when the type is a blittable type
     * @returns the unpacked array as an array(s) of typed arrays
     */
    unpackBlittableType() {
        const rank = this.niType.getRank();
        if (rank === 1) {
            return this.unpackBlittable1DArray();
        }
        return this.unpackBlittableArray();
    }
    /**
     * Unpacks this array when it is a blittable 1D array
     * @returns the unpacked array as a typed arrays
     */
    unpackBlittable1DArray() {
        const elementType = this.niType.getSubtype();
        const arrayValue = new NationalInstruments.PackedData.PackedBlittable1DArrayValue();
        arrayValue.__init(this.packedData.bb_pos, this.packedData.bb);
        const valueArray = arrayValue.valueArray() || new Int8Array(0);
        const typedArray = NIPackedArrayUtils.createArrayFromByteArray(elementType, valueArray, valueArray.byteOffset, arrayValue.length(), this.unpackIntoJSArray());
        return typedArray;
    }
    /**
     * Unpacks this array when it is a blittable multi-dimensional array
     * @returns the unpacked array as an  array(s) of typed array
     */
    unpackBlittableArray() {
        const arrayValue = new NationalInstruments.PackedData.PackedBlittableArrayValue();
        arrayValue.__init(this.packedData.bb_pos, this.packedData.bb);
        const elementType = NITypeUtils.getArrayElementType(this.niType);
        const elementSize = NITypeUtils.getBlittableArrayElementSize(this.niType);
        const dimensions = arrayValue.dimensionsArray();
        const valueArray = arrayValue.valueArray() || new Int8Array(0);
        if (dimensions == null || dimensions.length === 0) {
            return NIPackedArrayUtils.getPreAllocatedTypedArray(elementType, 0);
        }
        const unpackingInfo = new NIArrayUnpackingInfo(elementSize, elementType, dimensions, valueArray);
        const index = dimensions.length - 1;
        const unpackedArray = this.unpackBlittableSubArray(unpackingInfo, index);
        return unpackedArray;
    }
    /**
     * Unpacks dimension of a packed multi-dimensional array
     * @param unpackingInfo information about the current unpacking operation
     * @param dimensionIndex the dimension index to unpack
     * @returns the unpacked subarray
     */
    unpackBlittableSubArray(unpackingInfo, dimensionIndex) {
        if (dimensionIndex === 0) {
            const startOffset = unpackingInfo.valueArray.byteOffset + unpackingInfo.consumedBytes;
            const subArray = NIPackedArrayUtils.createArrayFromByteArray(unpackingInfo.elementType, unpackingInfo.valueArray, startOffset, unpackingInfo.dimensions[0], this.unpackIntoJSArray());
            unpackingInfo.consumedBytes += unpackingInfo.dimensionByteCount;
            return subArray;
        }
        const elementCount = unpackingInfo.dimensions[dimensionIndex];
        const result = new Array(elementCount);
        for (let x = 0; x < elementCount; x++) {
            result[x] = this.unpackBlittableSubArray(unpackingInfo, dimensionIndex - 1);
        }
        return result;
    }
    unpackIntoJSArray() {
        return this.unpackingOptions === undefined
            || this.unpackingOptions.supportsArrayLikeTypes === undefined
            || this.unpackingOptions.supportsArrayLikeTypes !== true;
    }
}
/**
 * Helper class to pack an array (blittable or otherwise) into a flat buffer.
 */
class NIArrayPacker {
    /**
     * Constructs the Array Packer class.
     * @param {flatbuffers.Builder} builder the builder to use for packing the data value
     * @param {*} dataToPack the array value to pack
     * @param {NIType} niType the data type of the array
     */
    constructor(builder, dataToPack, niType) {
        this.builder = builder;
        this.dataToPack = dataToPack;
        this.niType = niType;
        if (NITypeUtils.isBlittableArrayType(this.niType)) {
            this.dimensions = NIPackedArrayUtils.getArrayDimensions(dataToPack);
        }
        else {
            this.dimensions = [this.dataToPack.length];
        }
    }
    /**
     * Packs an array value into a flat buffer.
     * @returns {number} the buffer offset of the packed array value.
     */
    pack() {
        if (NITypeUtils.isBlittableArrayType(this.niType)) {
            const byteArray = NIPackedArrayUtils.convertArrayToFlattenedInt8Array(this.dataToPack, this.niType);
            return this.packBlittableArray(byteArray);
        }
        return this.packObjectArray();
    }
    /**
     * Packs an array of objects (non-blittable) into a flat buffer.
     * @returns {number} the buffer offset of the packed array value.
     */
    packObjectArray() {
        const offsets = [];
        const subType = this.niType.getSubtype();
        for (let x = 0; x < this.dataToPack.length; ++x) {
            const currentValue = this.dataToPack[x];
            const elementOffset = NationalInstruments.PackedData.NIPackedDataAdaptors.PackDataValue(this.builder, currentValue, subType, false);
            offsets[x] = elementOffset;
        }
        const valuesOffset = NationalInstruments.PackedData.PackedArrayValue.createValueVector(this.builder, offsets);
        const dimensionOffset = NationalInstruments.PackedData.PackedArrayValue.createDimensionsVector(this.builder, this.dimensions);
        NationalInstruments.PackedData.PackedArrayValue.startPackedArrayValue(this.builder);
        NationalInstruments.PackedData.PackedArrayValue.addDimensions(this.builder, dimensionOffset);
        NationalInstruments.PackedData.PackedArrayValue.addValue(this.builder, valuesOffset);
        return NationalInstruments.PackedData.PackedArrayValue.endPackedArrayValue(this.builder);
    }
    /**
     * Packs an blittable array into a flat buffer.
     * @param byteArray is the blittable array converted to a byte-array (Int8Array).
     * @returns {number} the buffer offset of the packed array value.
     */
    packBlittableArray(byteArray) {
        const valueOffset = NationalInstruments.PackedData.PackedBlittable1DArrayValue.createValueVector(this.builder, byteArray);
        if (this.dimensions.length === 1) {
            return this.packBlittable1DArray(valueOffset);
        }
        const dimensionsOffset = NationalInstruments.PackedData.PackedBlittableArrayValue.createDimensionsVector(this.builder, this.dimensions);
        return this.packBlittableMultiDimensionalArray(valueOffset, dimensionsOffset);
    }
    /**
     * Packs an 1D-blittable array into a flat buffer.
     * @param valueOffset offset at which the array value was serialized in the buffer.
     * @returns {number} the buffer offset of the packed array value.
     */
    packBlittable1DArray(valueOffset) {
        NationalInstruments.PackedData.PackedBlittable1DArrayValue.startPackedBlittable1DArrayValue(this.builder);
        NationalInstruments.PackedData.PackedBlittable1DArrayValue.addValue(this.builder, valueOffset);
        NationalInstruments.PackedData.PackedBlittable1DArrayValue.addLength(this.builder, this.dataToPack.length);
        return NationalInstruments.PackedData.PackedBlittable1DArrayValue.endPackedBlittable1DArrayValue(this.builder);
    }
    /**
     * Packs a multi-dimensional blittable array into a flat buffer.
     * @param valueOffset offset at which the array value was serialized in the buffer.
     * @param diimensionsOffset offset at which the dimensions of the array was serialized in the buffer.
     * @returns {number} the buffer offset of the packed array value.
     */
    packBlittableMultiDimensionalArray(valueOffset, dimensionsOffset) {
        NationalInstruments.PackedData.PackedBlittableArrayValue.startPackedBlittableArrayValue(this.builder);
        NationalInstruments.PackedData.PackedBlittableArrayValue.addValue(this.builder, valueOffset);
        NationalInstruments.PackedData.PackedBlittableArrayValue.addDimensions(this.builder, dimensionsOffset);
        return NationalInstruments.PackedData.PackedBlittableArrayValue.endPackedBlittableArrayValue(this.builder);
    }
}
/**
 * Manages state information about the current array unpacking information
 */
class NIArrayUnpackingInfo {
    /**
     * Constructor
     * @param elementSize The element size of the array
     * @param elementType the type (NIType) of the array elements
     * @param dimensions Array dimension information
     * @param valueArray Byte array containing the array elements
     */
    constructor(elementSize, elementType, dimensions, valueArray) {
        this.elementSize = elementSize;
        this.elementType = elementType;
        this.dimensions = dimensions;
        this.valueArray = valueArray;
        this.dimensionByteCount = dimensions[0] * elementSize;
        this.consumedBytes = 0;
    }
}
// @ts-ignore
NationalInstruments.PackedData = NationalInstruments.PackedData || {};
NationalInstruments.PackedData.NIPackedArrayDataAdaptor = NIPackedArrayDataAdaptor;
//# sourceMappingURL=niPackedArrayAdaptor.js.map