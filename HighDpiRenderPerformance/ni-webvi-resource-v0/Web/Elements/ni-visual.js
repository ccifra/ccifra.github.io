"use strict";
//****************************************
// Visual Prototype
// DOM Registration: No
// National Instruments Copyright 2014
//****************************************
// Static Public Variables
// None
(function () {
    'use strict';
    // Static Private Reference Aliases
    // var NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class Visual extends NationalInstruments.HtmlVI.Elements.VisualComponent {
        // Static Private Variables
        // None
        // Static Private Functions
        // None
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = Visual.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'readOnly',
                defaultValue: false
            });
            /// Creates a JavaScript bindingInfo property. This is a JsonObject containing:
            ///     prop (string) -the JavaScript model property that corresponds to the controls value (ie value, text, selectedIndex)
            ///     field (string) - for cluster sub-elements, the name of that element
            ///     sync (boolean) - for charts (and some day boolean latch), whether or not updates are only performed synchronously
            ///     dco (number) - dco index of the top level control used by RT protocol
            ///     dataItem (string) - the name for VIREO binding - same as DataItem.CompiledName
            ///     accessMode (string) - whether this is read-only (control), write-only (indicator), or read-write
            ///     unplacedOrDisabled (bool) - indicates whether the control is unplaced/disabled on the block diagram
            ///     isLatched (bool) - indicates whether the control has latching enabled.
            /// Keep documentation in-sync between ni-visual.js, jqxElementCommonPropertiesModule.js, and BindingInfoGenerator.cs
            proto.addProperty(targetPrototype, {
                propertyName: 'bindingInfo',
                defaultValue: {
                    prop: '',
                    field: '',
                    sync: false,
                    dco: -1,
                    dataItem: '',
                    accessMode: '',
                    unplacedOrDisabled: false,
                    isLatched: false
                }
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'labelId',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'controlResizeMode',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'labelAlignment',
                defaultValue: ''
            });
        }
        clearProperties() {
            super.clearProperties();
            this.readOnly = false;
            this.bindingInfo = {
                prop: '',
                field: '',
                sync: false,
                dco: -1,
                dataItem: '',
                accessMode: '',
                unplacedOrDisabled: false,
                isLatched: false
            };
            this.labelId = '';
            this.controlResizeMode = '';
            this.labelAlignment = '';
        }
        // Only implement for broken child elements that for some reason do not inherit
        // font properties from the containing custom element
        setFont(fontSize, fontFamily, fontWeight, fontStyle, textDecoration) {
            this.style.fontSize = fontSize;
            this.style.fontFamily = fontFamily;
            this.style.fontWeight = fontWeight;
            this.style.fontStyle = fontStyle;
            this.style.textDecoration = textDecoration;
        }
    }
    NationalInstruments.HtmlVI.Elements.Visual = Visual;
}());
//# sourceMappingURL=ni-visual.js.map