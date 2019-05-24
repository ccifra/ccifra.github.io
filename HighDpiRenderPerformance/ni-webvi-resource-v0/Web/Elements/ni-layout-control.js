"use strict";
//****************************************
// Layout Control
// DOM Registration: No
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    const layoutsEnum = Object.freeze({
        ABSOLUTE: 'absolute',
        FLEXIBLE: 'flexible'
    });
    class LayoutControl extends NationalInstruments.HtmlVI.Elements.Visual {
        static get LayoutsEnum() {
            return layoutsEnum;
        }
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = LayoutControl.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'layout',
                defaultValue: LAYOUTS_ENUM.ABSOLUTE
            });
        }
    }
    NationalInstruments.HtmlVI.Elements.LayoutControl = LayoutControl;
    const LAYOUTS_ENUM = NationalInstruments.HtmlVI.Elements.LayoutControl.LayoutsEnum;
}());
//# sourceMappingURL=ni-layout-control.js.map