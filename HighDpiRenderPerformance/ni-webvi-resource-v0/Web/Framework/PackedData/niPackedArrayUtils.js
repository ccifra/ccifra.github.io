"use strict";
/**
 * Array Helpers used in Data Packing.
 */
class NIPackedArrayUtils {
    /**
     * Gets the array of lengths of each dimensions
     * @param arrayData Array data on which this method works on
     * @returns Array of dimensions (each entry is the size of the corresponding dimension)
     */
    static getArrayDimensions(arrayData) {
        const dimensions = [arrayData.length];
        while (Array.isArray(arrayData[0])) {
            arrayData = arrayData[0];
            dimensions.push(arrayData.length);
        }
        return dimensions;
    }
    /**
     * Creates array from the given byte array starting from the given offset within the byte array for the given length.
     * @param elementType the array element type
     * @param valueArray The byte array containing the array elements
     * @param byteOffset the byte offset where the array elements start
     * @param length the element length of the array
     * @param convertToJSArray whether to convert the
     */
    static createArrayFromByteArray(niType, byteArray, byteOffset, length, convertToJSArray) {
        const typedArray = NIPackedArrayUtils.createTypedArrayForValue(niType, byteArray, byteOffset, length);
        if (convertToJSArray) {
            return NIPackedArrayUtils.convertTypedArrayIntoArray(typedArray, niType);
        }
        return typedArray;
    }
    /**
     * Converts a JS array into a ByteArray. If the arrayData is a multi dimensional array, then the array will be flattened as a single dimensional byte array.
     * @param arrayData Array data on which this method works on
     * @param niType NI Type of the arrayData element
     * @returns Flattened byte array
     */
    static convertArrayToFlattenedInt8Array(arrayData, niType) {
        const niArrayType = NITypeUtils.getArrayElementType(niType);
        const dimensions = NIPackedArrayUtils.getArrayDimensions(arrayData);
        let totalElements = 1;
        for (const dimension of dimensions) {
            totalElements = totalElements * dimension;
        }
        const flattenedTypedArray = NIPackedArrayUtils.getPreAllocatedTypedArray(niArrayType, totalElements);
        NIPackedArrayUtils.createTypedArrayRecursive(arrayData, dimensions, niArrayType, flattenedTypedArray, 0);
        const byteArray = new Int8Array(flattenedTypedArray.buffer);
        return byteArray;
    }
    /**
     * Creates a Typed Array (type corresponds to the given niArrayType) with size
     * @param niArrayType NIType of the elements
     * @param size pre-allocation size of the TypedArray being created
     */
    static getPreAllocatedTypedArray(niArrayType, size) {
        return NIPackedArrayUtils.getTypedArrayFromSize(niArrayType, size);
    }
    /**
     * Fills the pre-allocated flattenedTypedArray with the data from arrayData.
     * For a multi-dimensional array, it recurses to each dimension and fills up the flattenedTypedArray.
     * @param arrayData Array which is being flattened.
     * @param dimensions Dimension array corresponding to the arrayData.
     * @param niArrayType NIType of the elements in arrayData.
     * @param flattenedTypedArray Pre-allocated TypedArray that will be filled.
     * @param offset Current offset in the pre-allocated flattenedTypedArray.
     * @returns updated offset after filling up the flattenedArray
     */
    static createTypedArrayRecursive(arrayData, dimensions, niArrayType, flattenedTypedArray, offset) {
        if (dimensions.length === 1) {
            const typedArray = NIPackedArrayUtils.getTypedArray(niArrayType, arrayData);
            flattenedTypedArray.set(typedArray, offset);
            return offset + typedArray.length;
        }
        for (let i = 0; i < dimensions[0]; ++i) {
            offset = NIPackedArrayUtils.createTypedArrayRecursive(arrayData[i], dimensions.slice(1), niArrayType, flattenedTypedArray, offset);
        }
        return offset;
    }
    /**
     * Creates a Typed Array (type corresponds to the given niArrayType) with contents populated with the given JS array
     * @param niArrayType NIType of the elements
     * @param array JS Array to be copied onto the created TypedArray
     */
    static getTypedArray(niArrayType, array) {
        return NIPackedArrayUtils.getTypedArrayFromArray(niArrayType, array);
    }
    static getTypedArrayFromSize(niArrayType, size) {
        switch (niArrayType.getName()) {
            case NITypeNames.UINT8:
                return new Uint8Array(size);
            case NITypeNames.BOOLEAN:
            case NITypeNames.INT8:
                return new Int8Array(size);
            case NITypeNames.UINT16:
                return new Uint16Array(size);
            case NITypeNames.INT16:
                return new Int16Array(size);
            case NITypeNames.UINT32:
                return new Uint32Array(size);
            case NITypeNames.INT32:
                return new Int32Array(size);
            case NITypeNames.SINGLE:
                return new Float32Array(size);
            case NITypeNames.ENUM:
            case NITypeNames.INT64:
            case NITypeNames.UINT64:
            case NITypeNames.DOUBLE:
                return new Float64Array(size);
            case NITypeNames.COMPLEXSINGLE:
                return new Float32Array(size * 2);
            case NITypeNames.COMPLEXDOUBLE:
                return new Float64Array(size * 2);
        }
        return undefined;
    }
    static getTypedArrayFromArray(niArrayType, array) {
        switch (niArrayType.getName()) {
            case NITypeNames.UINT8:
                return new Uint8Array(array);
            case NITypeNames.BOOLEAN:
            case NITypeNames.INT8:
                return new Int8Array(array);
            case NITypeNames.UINT16:
                return new Uint16Array(array);
            case NITypeNames.INT16:
                return new Int16Array(array);
            case NITypeNames.UINT32:
                return new Uint32Array(array);
            case NITypeNames.INT32:
                return new Int32Array(array);
            case NITypeNames.SINGLE:
                return new Float32Array(array);
            case NITypeNames.ENUM:
            case NITypeNames.INT64:
            case NITypeNames.UINT64:
            case NITypeNames.DOUBLE:
                return new Float64Array(array);
            case NITypeNames.COMPLEXSINGLE:
                const complexSingleByteArray = [];
                for (let i = 0, length = array.length; i < length; i++) {
                    complexSingleByteArray.push(array[i].realPart);
                    complexSingleByteArray.push(array[i].imaginaryPart);
                }
                return new Float32Array(complexSingleByteArray);
            case NITypeNames.COMPLEXDOUBLE:
                const complexDoubleByteArray = [];
                for (let i = 0, length = array.length; i < length; i++) {
                    complexDoubleByteArray.push(array[i].realPart);
                    complexDoubleByteArray.push(array[i].imaginaryPart);
                }
                return new Float64Array(complexDoubleByteArray);
        }
        return undefined;
    }
    /**
     * Creates a typed array for the specified array elements
     * @param elementType the array element type
     * @param valueArray The byte array containing the array elements
     * @param byteOffset the byte offset where the array elements start
     * @param length the element length of the array
     */
    static createTypedArrayForValue(niType, valueArray, byteOffset, length) {
        switch (niType.getName()) {
            case NITypeNames.BOOLEAN:
            case NITypeNames.INT8:
                return new Int8Array(valueArray.buffer, byteOffset, length);
            case NITypeNames.UINT8:
                return new Uint8Array(valueArray.buffer, byteOffset, length);
            case NITypeNames.UINT16:
                return new Uint16Array(valueArray.buffer, byteOffset, length);
            case NITypeNames.UINT32:
                return new Uint32Array(valueArray.buffer, byteOffset, length);
            case NITypeNames.INT16:
                return new Int16Array(valueArray.buffer, byteOffset, length);
            case NITypeNames.INT32:
                return new Int32Array(valueArray.buffer, byteOffset, length);
            case NITypeNames.SINGLE:
                return new Float32Array(valueArray.buffer, byteOffset, length);
            case NITypeNames.DOUBLE:
                return new Float64Array(valueArray.buffer, byteOffset, length);
            case NITypeNames.COMPLEXSINGLE:
                return new Float32Array(valueArray.buffer, byteOffset, length * 2);
            case NITypeNames.COMPLEXDOUBLE:
                return new Float64Array(valueArray.buffer, byteOffset, length * 2);
        }
        return undefined;
    }
    /**
     * Converts Typed array into a JS array.
     * @param typedArray
     * @param niType
     */
    static convertTypedArrayIntoArray(typedArray, niType) {
        const elementCount = typedArray.length;
        const isComplexArray = niType.isComplex();
        if (isComplexArray) {
            const result = new Array(elementCount / 2);
            for (let x = 0, i = 0; x < elementCount; x = x + 2, i++) {
                result[i] = new window.NIComplex(typedArray[x], typedArray[x + 1]);
            }
            return result;
        }
        else {
            const isBooleanArray = niType.isBoolean();
            const result = new Array(elementCount);
            for (let x = 0; x < elementCount; x++) {
                if (isBooleanArray) {
                    result[x] = typedArray[x] !== 0;
                }
                else {
                    result[x] = typedArray[x];
                }
            }
            return result;
        }
    }
}
/**
 * Static helper functions dealing with NI Types for Array Packing.
 */
class NITypeUtils {
    /**
     * Determines if this array contains a blittable type
     * @param niType the array element type
     */
    static isBlittableArrayType(niType) {
        switch (niType.getName()) {
            case NITypeNames.BOOLEAN:
            case NITypeNames.UINT8:
            case NITypeNames.UINT16:
            case NITypeNames.UINT32:
            case NITypeNames.INT8:
            case NITypeNames.INT16:
            case NITypeNames.INT32:
            case NITypeNames.SINGLE:
            case NITypeNames.DOUBLE:
            case NITypeNames.ENUM:
            case NITypeNames.INT64:
            case NITypeNames.UINT64:
            case NITypeNames.COMPLEXSINGLE:
            case NITypeNames.COMPLEXDOUBLE:
                return true;
            //  [TODO] : Following types will eventually become blittable.
            // case NITypeNames.TIMESTAMP:
            case NITypeNames.ARRAY:
                const niArrayType = NITypeUtils.getArrayElementType(niType);
                return NITypeUtils.isBlittableArrayType(niArrayType);
        }
        return false;
    }
    /**
     * Gets the element size (bytes) of a blittable array element
     * @param niType the array element type
     */
    static getBlittableArrayElementSize(niType) {
        switch (niType.getName()) {
            case NITypeNames.BOOLEAN:
            case NITypeNames.UINT8:
            case NITypeNames.INT8:
                return 1;
            case NITypeNames.UINT16:
            case NITypeNames.INT16:
                return 2;
            case NITypeNames.UINT32:
            case NITypeNames.INT32:
            case NITypeNames.SINGLE:
            case NITypeNames.ENUM:
                return 4;
            case NITypeNames.DOUBLE:
            case NITypeNames.COMPLEXSINGLE:
            case NITypeNames.INT64:
            case NITypeNames.UINT64:
                return 8;
            case NITypeNames.COMPLEXDOUBLE:
                return 16;
            case NITypeNames.TIMESTAMP:
                return 16;
            case NITypeNames.ARRAY:
                const niArrayType = NITypeUtils.getArrayElementType(niType);
                return NITypeUtils.getBlittableArrayElementSize(niArrayType);
        }
        return 0;
    }
    /**
     * Gets the array element type (NIType) of this array
     * @param niType the array element type
     */
    static getArrayElementType(niType) {
        let subType = niType.getSubtype();
        while (subType.getName() === NITypeNames.ARRAY) {
            subType = subType.getSubtype();
        }
        return subType;
    }
}
//# sourceMappingURL=niPackedArrayUtils.js.map