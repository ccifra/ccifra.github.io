"use strict";
/**
 * Adaptor for ComplexDouble type
 */
class NIPackedComplexDoubleAdaptor {
    /**
     * Packs a ComplexDouble value into a flat buffer
     * @static
     * @param {flatbuffers.Builder} builder the builder to use for packing the data value
     * @param {NIComplex} complexDataToPack the array value to pack
     * @param {NIType} niType the data type of the array
     * @returns {number} the buffer offset of the packed array value
     * @memberof NIPackedArrayDataAdaptor
     */
    static PackDataValue(builder, complexDataToPack, niType) {
        NationalInstruments.PackedData.PackedComplexFloat64Value.startPackedComplexFloat64Value(builder);
        NationalInstruments.PackedData.PackedComplexFloat64Value.addImaginary(builder, complexDataToPack.imaginaryPart);
        NationalInstruments.PackedData.PackedComplexFloat64Value.addReal(builder, complexDataToPack.realPart);
        return NationalInstruments.PackedData.PackedComplexFloat64Value.endPackedComplexFloat64Value(builder);
    }
    /**
     * Creates an instance adaptor class.
     * @param packedData the packed data to wrap
     * @param niType The type ofthe packed data
     */
    constructor(packedData, niType, options) {
        this.niType = niType;
        this.packedData = packedData;
    }
    /**
     * Gets the type of this array as an NIType
     * @returns The NIType
     */
    getType() {
        return this.niType;
    }
    /**
     * Unpacks this complex into into a standard JavaScript object
     * @returns the unpacked JS NIComplex object
     */
    unpack() {
        const complexValue = new NationalInstruments.PackedData.PackedComplexFloat64Value();
        complexValue.__init(this.packedData.bb_pos, this.packedData.bb);
        return new window.NIComplex(complexValue.real(), complexValue.imaginary());
    }
}
// @ts-ignore
NationalInstruments.PackedData = NationalInstruments.PackedData || {};
NationalInstruments.PackedData.NIPackedComplexDoubleAdaptor = NIPackedComplexDoubleAdaptor;
//# sourceMappingURL=niPackedComplexDoubleAdaptor.js.map