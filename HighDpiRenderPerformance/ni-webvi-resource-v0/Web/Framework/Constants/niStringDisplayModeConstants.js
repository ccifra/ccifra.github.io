"use strict";
/**
 * Display mode constant for string control.
 * National Instruments Copyright 2018
 */
const textDisplayMode = Object.freeze({
    DEFAULT: "default",
    ESCAPED: "escaped"
});
class StringDisplayModeConstants {
    static get TextDisplayMode() {
        return textDisplayMode;
    }
}
// @ts-ignore
NationalInstruments.HtmlVI.StringDisplayModeConstants = StringDisplayModeConstants;
//# sourceMappingURL=niStringDisplayModeConstants.js.map