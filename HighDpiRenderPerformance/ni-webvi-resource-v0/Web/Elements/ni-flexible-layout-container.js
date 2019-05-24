//**************************************
// Flexible Layout Container Custom Element
// DOM Registration: No
// National Instruments Copyright 2018
//**************************************
'use strict';
JQX('ni-flexible-layout-container', class FlexibleLayoutContainer extends JQX.BaseElement {
    /** Flexible Layout Container's properties. */
    static get properties() {
        return {
            'direction': {
                value: 'row',
                type: 'string',
                defaultReflectToAttribute: true
            },
            'horizontalContentAlignment': {
                value: 'flex-start',
                type: 'string',
                defaultReflectToAttribute: true
            },
            'verticalContentAlignment': {
                value: 'flex-start',
                type: 'string',
                defaultReflectToAttribute: true
            }
        };
    }
    /** Flexible Layout Container's Html template. */
    template() {
        // If the template isn't empty string, JQX adds wrapper elements.
        return '';
    }
});
//# sourceMappingURL=ni-flexible-layout-container.js.map