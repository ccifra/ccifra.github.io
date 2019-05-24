"use strict";
//****************************************
// Url Image Control Prototype
// DOM Registration: No
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const STRETCH_ENUM = Object.freeze({
        NONE: 'none',
        UNIFORM: 'uniform',
        UNIFORM_TO_FILL: 'uniformtofill',
        FILL: 'fill' // Size so that the image fills the space ignoring aspect ratio (Stretch to fill space)
    });
    // Static Private Functions
    const createImage = function (urlImageElement) {
        const that = urlImageElement;
        // A div element with background css is used instead of an img element because the img element does not support the different stretch modes
        // but background images with css do support the different stretch modes
        const childElement = document.createElement('div');
        childElement.classList.add('ni-image-box');
        childElement.style.width = '100%';
        childElement.style.height = '100%';
        if (that.source !== '') {
            childElement.style.backgroundImage = 'url(' + that.source + ')';
        }
        // TODO mraj should validate enum value? currently assumes valid string
        if (that.stretch !== '' && that.stretch !== STRETCH_ENUM.NONE) {
            childElement.classList.add('ni-stretch-' + that.stretch);
        }
        childElement.title = that.alternate;
        that.innerHTML = '';
        that.appendChild(childElement);
    };
    class UrlImage extends NationalInstruments.HtmlVI.Elements.Visual {
        // Static Private Variables
        // None
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = UrlImage.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'source',
                defaultValue: '',
                fireEvent: true,
                addNonSignalingProperty: true
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'alternate',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'stretch',
                defaultValue: STRETCH_ENUM.UNIFORM
            });
            NI_SUPPORT.setValuePropertyDescriptor(targetPrototype, 'source', 'source', 'sourceNonSignaling', 'source-changed');
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            if (firstCall === true) {
                createImage(this);
            }
            return firstCall;
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            switch (propertyName) {
                case 'source':
                    createImage(this);
                    break;
                case 'alternate':
                    createImage(this);
                    break;
                case 'stretch':
                    createImage(this);
                    break;
            }
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(UrlImage);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(UrlImage.prototype, 'ni-url-image', 'HTMLNIUrlImage');
    NationalInstruments.HtmlVI.Elements.UrlImage = UrlImage;
    NationalInstruments.HtmlVI.Elements.UrlImage.StretchEnum = STRETCH_ENUM;
}());
//# sourceMappingURL=ni-url-image.js.map