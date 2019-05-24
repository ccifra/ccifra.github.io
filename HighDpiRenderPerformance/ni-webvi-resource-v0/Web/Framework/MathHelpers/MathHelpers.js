"use strict";
/**
 * Math helper methods.
 * National Instruments Copyright 2018
 */
class MathHelpers {
    static clamp(num, min, max) {
        return Math.max(min, Math.min(num, max));
    }
}
// @ts-ignore
NationalInstruments.HtmlVI.MathHelpers = MathHelpers;
//# sourceMappingURL=MathHelpers.js.map