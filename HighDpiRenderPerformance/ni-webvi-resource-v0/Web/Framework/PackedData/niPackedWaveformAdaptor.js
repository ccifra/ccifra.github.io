"use strict";
/**
 * Adaptor for Waveform type
 */
class NIPackedWaveformAdaptor {
    /**
     * Packs a Waveform value into a flat buffer
     * @static
     * @param {flatbuffers.Builder} builder the builder to use for packing the data value
     * @param {NIWaveform} waveformDataToPack the Waveform value to pack
     * @param {NIType} niType the data type of the array
     * @returns {number} the buffer offset of the packed Waveform value
     * @memberof NIPackedWaveformAdaptor
     */
    static PackDataValue(builder, waveformDataToPack, niType) {
        const t0Offset = NationalInstruments.PackedData.NIPackedTimestampAdaptor.PackDataValue(builder, waveformDataToPack.t0);
        const yOffset = NationalInstruments.PackedData.NIPackedArrayDataAdaptor.PackDataValue(builder, waveformDataToPack.Y, niType.getSubtype().makeArray(1));
        const attributesOffset = 0; // todo - NationalInstruments.PackedData.NIPackedVariantDataAdaptor.PackDataValue(builder, waveformDataToPack.attributes);
        return NationalInstruments.PackedData.PackedWaveformValue.createPackedWaveformValue(builder, t0Offset, waveformDataToPack.dt, yOffset, attributesOffset);
    }
    /**
     * Creates an instance adaptor class.
     * @param packedData the packed data to wrap
     * @param niType The type ofthe packed data
     */
    constructor(packedData, niType, options) {
        this.niType = niType;
        this.packedData = packedData;
        this.options = options;
    }
    /**
     * Gets the type of this Waveform as an NIType
     * @returns The NIType
     */
    getType() {
        return this.niType;
    }
    /**
     * Unpacks this waveform into into a standard JavaScript object
     * @returns the unpacked JS NIWaveform object
     */
    unpack() {
        const waveformValue = new NationalInstruments.PackedData.PackedWaveformValue();
        waveformValue.__init(this.packedData.bb_pos, this.packedData.bb);
        const niWaveform = new window.NIAnalogWaveform();
        niWaveform.dt = waveformValue.dt();
        niWaveform.t0 = NationalInstruments.PackedData.NIPackedTimestampAdaptor.UnpackFromData(waveformValue.t0());
        const yUnpacker = new NIArrayUnpacker(waveformValue.y(), this.niType.getSubtype().makeArray(1), this.options);
        niWaveform.Y = yUnpacker.unpack();
        return niWaveform;
    }
}
// @ts-ignore
NationalInstruments.PackedData = NationalInstruments.PackedData || {};
NationalInstruments.PackedData.NIPackedWaveformAdaptor = NIPackedWaveformAdaptor;
//# sourceMappingURL=niPackedWaveformAdaptor.js.map