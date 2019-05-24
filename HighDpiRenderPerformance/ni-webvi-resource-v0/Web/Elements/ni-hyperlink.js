//****************************************
// Hyperlink Custom Element
// DOM Registration: No
// National Instruments Copyright 2015
//****************************************
'use strict';
JQX('ni-hyperlink', class Hyperlink extends JQX.BaseElement {
    // Hyperlink's properties.
    static get properties() {
        return {
            'href': {
                value: '',
                type: 'string'
            },
            'content': {
                value: '',
                type: 'string'
            }
        };
    }
    /** Hyperlink's Html template. */
    template() {
        return `<a></a>`;
    }
    /** Called when the element is ready. Used for one-time configuration of the Hyperlink. */
    ready() {
        const that = this;
        super.ready();
        const childElement = that.firstElementChild;
        if (!that.disabled) {
            childElement.setAttribute('href', that.href);
        }
        childElement.textContent = that.content;
    }
    /**
    * Updates the Hyperlink when a property is  changed.
    * @param {string} propertyName The name of the property.
    * @param {string} oldValue The previously entered value.
    * @param {string} newValue The new entered value.
    */
    propertyChangedHandler(propertyName, oldValue, newValue) {
        const that = this;
        super.propertyChangedHandler(propertyName, oldValue, newValue);
        const childElement = that.firstElementChild;
        switch (propertyName) {
            case 'href':
                if (!that.disabled) {
                    childElement.setAttribute('href', that.href);
                }
                break;
            case 'content':
                childElement.textContent = that.content;
                break;
            case 'disabled':
                if (that.disabled) {
                    childElement.removeAttribute('href');
                }
                else {
                    childElement.setAttribute('href', that.href);
                }
                break;
        }
    }
});
//# sourceMappingURL=ni-hyperlink.js.map