"use strict";
//****************************************
// Label Prototype
// DOM Registration: No
// National Instruments Copyright 2015
//****************************************
// Static Public Variables
// None
(function () {
    'use strict';
    // Static Private Reference Aliases
    // var NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class Label extends NationalInstruments.HtmlVI.Elements.Visual {
        // Static Private Variables
        // None
        // Static Private Functions
        // None
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = Label.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'text',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'controlId',
                defaultValue: ''
            });
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            if (firstCall === true) {
                const labelTag = document.createElement('label');
                this.appendChild(labelTag);
                labelTag.textContent = this.text;
                // We want to eventually associate labels with their widgets so that screen readers can associate them.
                // This is sort of how we would do it, but this doesn't work because the id that htmlFor points to
                // needs to be an input, which our controls are not (the have children that are inputs)
                // labelTag.htmlFor = this.controlId;
            }
            return firstCall;
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            const labelElement = this.firstElementChild;
            switch (propertyName) {
                case 'text':
                    labelElement.textContent = this.text;
                    break;
                default:
                    break;
            }
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(Label);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(Label.prototype, 'ni-label', 'HTMLNILabel');
    NationalInstruments.HtmlVI.Elements.Label = Label;
}());
//# sourceMappingURL=ni-label.js.map