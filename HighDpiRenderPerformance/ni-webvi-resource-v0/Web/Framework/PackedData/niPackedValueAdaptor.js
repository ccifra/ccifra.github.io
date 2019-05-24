"use strict";
/**
 * General adaptor for value type packed data
 */
class NIPackedValueAdaptor {
    /**
     * Creates an instance of nipacked value adaptor.
     * @param packedData The packed data to wrap
     * @param niType The NITYpe of the packed data
     */
    constructor(packedData, niType, options) {
        this.packedData = packedData;
        this.niType = niType;
        this.unpackingOptions = options;
    }
    /**
     * Gets the type of this array as an NIType
     */
    getType() {
        return this.niType;
    }
    /**
     * Unpacks this array into a standard JavaScript object
     */
    unpack() {
        return this.packedData.value();
    }
}
// @ts-ignore
NationalInstruments.PackedData = NationalInstruments.PackedData || {};
NationalInstruments.PackedData.NIPackedValueAdaptor = NIPackedValueAdaptor;
//# sourceMappingURL=niPackedValueAdaptor.js.map