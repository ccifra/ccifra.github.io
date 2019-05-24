"use strict";
//****************************************
// Virtual Instrument Prototype
// DOM Registration: HTMLNIVirtualInstrument
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class VirtualInstrument extends NationalInstruments.HtmlVI.Elements.NIElement {
        // Static Private Variables
        // None
        // Static Private Functions
        // None
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = VirtualInstrument.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'viName',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'viRef',
                defaultValue: ''
            });
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            NationalInstruments.HtmlVI.viReferenceService.registerVIElement(this);
            return firstCall;
        }
        detachedCallback() {
            NationalInstruments.HtmlVI.viReferenceService.unregisterVIElement(this);
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(VirtualInstrument);
    NationalInstruments.HtmlVI.Elements.NIElement.defineElementInfo(VirtualInstrument.prototype, 'ni-virtual-instrument', 'HTMLNIVirtualInstrument');
    NationalInstruments.HtmlVI.Elements.VirtualInstrument = VirtualInstrument;
}());
//# sourceMappingURL=ni-virtual-instrument.js.map