"use strict";
/**
 * Event Id constants
 * All of these constants are defined in the corresponding IDiagramEvent through EventId.
 * They are GUIDs that uniquely identify the event class.
 * National Instruments Copyright 2018
 */
class CommonEventIdConstants {
    // Defined in ValueChangedDiagramEvent.cs
    static get VALUE_CHANGED() {
        return "{F3226E31-E688-4C58-AE1E-7ED6718409A1}";
    }
}
// @ts-ignore
NationalInstruments.HtmlVI.CommonEventIdConstants = CommonEventIdConstants;
//# sourceMappingURL=niEventIdConstants.js.map