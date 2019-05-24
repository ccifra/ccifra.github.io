"use strict";
//**********************************************************
// Service that handles registration of ni-elements
// National Instruments Copyright 2019
//**********************************************************
(function () {
    'use strict';
    const registeredElements = [];
    /** This class provides the methods to define custom elements for ni-element based elements */
    class NIElementRegistrationService {
        /**
         * Registers the ni-element based element with the registration service
         * @param {NIElement} element - The element to register.
         */
        static registerElement(element) {
            registeredElements.push(element);
        }
        /** Defines custom elements for all the registered elements. This must be called once after we are done loading all the files. */
        static completeRegistration() {
            registeredElements.forEach((element) => {
                window.NationalInstruments.HtmlVI.Elements.NIElement._finalizeObservedAttributes(element);
                window.customElements.define(element.prototype.elementInfo.tagName, element);
            });
            window.NationalInstruments.HtmlVI.Elements.NIElement.notifyElementsRegistered();
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService = NIElementRegistrationService;
}());
//# sourceMappingURL=niElementRegistrationService.js.map