"use strict";
/**
 * Adaptor for Timestamp type
 */
class NIPackedTimestampAdaptor {
    /**
     * Unpack from the given initialized PackedData
     * @param timestampValue Initialized packed data
     * @returns unpacked Timestamp
     */
    static UnpackFromData(timestampValue) {
        const niTimestamp = new window.NITimestamp();
        niTimestamp.seconds = timestampValue.seconds().toFloat64();
        niTimestamp.fractions = timestampValue.fractions().toFloat64();
        return niTimestamp;
    }
    /**
     * Packs a Timestamp value into a flat buffer
     * @static
     * @param {flatbuffers.Builder} builder the builder to use for packing the data value
     * @param {NITimestamp} timestampDataToPack the Timestamp value to pack
     * @returns {number} the buffer offset of the packed Timestamp value
     * @memberof NIPackedTimestampAdaptor
     */
    static PackDataValue(builder, timestampDataToPack) {
        NationalInstruments.PackedData.PackedTimestampValue.startPackedTimestampValue(builder);
        NationalInstruments.PackedData.PackedTimestampValue.addSeconds(builder, NIPackedTimestampAdaptor.CreateFlatbuffersLong(timestampDataToPack.seconds));
        NationalInstruments.PackedData.PackedTimestampValue.addFractions(builder, NIPackedTimestampAdaptor.CreateFlatbuffersLong(timestampDataToPack.fractions));
        return NationalInstruments.PackedData.PackedTimestampValue.endPackedTimestampValue(builder);
    }
    /**
     * Helper method inspired from : https://groups.google.com/forum/#!topic/flatbuffers/ieXNEsB_2wc
     * For now, this is kept only in timestamp as the int64s here cannot be negative.
     * At a point when int64 needs to be fixed this needs to be made to handle -ve numbers as well.
     * @param {number} value number if float64 format to convert it into flatBuffers.Long
     */
    static CreateFlatbuffersLong(value) {
        const hexString = value.toString(16);
        const totalNibbles = hexString.length;
        let high = 0;
        let low = 0;
        if (totalNibbles <= 8) {
            low = totalNibbles > 0 ? value : 0;
        }
        else {
            const lowString = hexString.substring(totalNibbles - 8, totalNibbles);
            low = parseInt(lowString, 16);
            const highString = hexString.substring(0, totalNibbles - 8);
            high = parseInt(highString, 16);
        }
        const longInt = flatbuffers.Long.create(low, high);
        return longInt;
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
     * Gets the type of this Timestamp as an NIType
     * @returns The NIType
     */
    getType() {
        return this.niType;
    }
    /**
     * Unpacks this timestamp into into a standard JavaScript object
     * @returns the unpacked JS NITimestamp object
     */
    unpack() {
        const timestampValue = new NationalInstruments.PackedData.PackedTimestampValue();
        timestampValue.__init(this.packedData.bb_pos, this.packedData.bb);
        return NIPackedTimestampAdaptor.UnpackFromData(timestampValue);
    }
}
// @ts-ignore
NationalInstruments.PackedData = NationalInstruments.PackedData || {};
NationalInstruments.PackedData.NIPackedTimestampAdaptor = NIPackedTimestampAdaptor;
//# sourceMappingURL=niPackedTimestampAdaptor.js.map