"use strict";
//****************************************
// Text Prototype
// DOM Registration: No
// National Instruments Copyright 2015
//****************************************
// Static Public Variables
// None
(function () {
    'use strict';
    // Static Private Reference Aliases
    // var NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class Text extends NationalInstruments.HtmlVI.Elements.Visual {
        // Static Private Variables
        // None
        // Static Private Functions
        // None
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = Text.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'text',
                defaultValue: ''
            });
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            let divTag;
            if (firstCall === true) {
                divTag = document.createElement('div');
                divTag.textContent = this.text;
                this.appendChild(divTag);
            }
            return firstCall;
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            const divElement = this.firstElementChild;
            switch (propertyName) {
                case 'text':
                    divElement.textContent = this.text;
                    break;
                default:
                    break;
            }
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(Text);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(Text.prototype, 'ni-text', 'HTMLNIText');
    NationalInstruments.HtmlVI.Elements.Text = Text;
}());
//# sourceMappingURL=ni-text.js.map