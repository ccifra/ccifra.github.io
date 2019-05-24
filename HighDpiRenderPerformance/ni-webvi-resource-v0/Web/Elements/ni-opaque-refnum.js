"use strict";
//**************************************
// OpaqueRefnum Control Prototype
// DOM Registration: No
// National Instruments Copyright 2014
//**************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    // var NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class OpaqueRefnum extends NationalInstruments.HtmlVI.Elements.Visual {
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(OpaqueRefnum);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(OpaqueRefnum.prototype, 'ni-opaque-refnum', 'HTMLNIOpaqueRefnum');
    NationalInstruments.HtmlVI.Elements.OpaqueRefnum = OpaqueRefnum;
}());
//# sourceMappingURL=ni-opaque-refnum.js.map