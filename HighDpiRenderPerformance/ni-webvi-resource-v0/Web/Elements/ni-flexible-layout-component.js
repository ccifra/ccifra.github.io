//**************************************
// Flexible Layout Component Control Prototype
// DOM Registration: No
// National Instruments Copyright 2018
//**************************************
'use strict';
JQX('ni-flexible-layout-component', class FlexibleLayoutComponent extends JQX.BaseElement {
    /** Flexible Layout Component's properties. */
    static get properties() {
        return {
            'layoutPattern': {
                value: '',
                type: 'string',
                defaultReflectToAttribute: true
            }
        };
    }
    /** Flexible Layout Component's Html template. */
    template() {
        // If the template isn't empty string, JQX adds wrapper elements.
        return '';
    }
});
//# sourceMappingURL=ni-flexible-layout-component.js.map