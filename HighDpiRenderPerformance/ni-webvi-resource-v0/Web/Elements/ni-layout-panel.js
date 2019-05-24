"use strict";
//****************************************
// Layout Panel Prototype
// DOM Registration: HTMLNILayoutPanel
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class LayoutPanel extends NationalInstruments.HtmlVI.Elements.LayoutControl {
        // Static Private Variables
        // None
        // Static Private Functions
        // None
        // Public Prototype Methods
        forceResizeChildren() {
            const children = this.children;
            for (let i = 0; i < children.length; i++) {
                if (NI_SUPPORT.isElement(children[i])) {
                    if (typeof children[i].forceResize === 'function') {
                        if (children[i]._latestSize) {
                            children[i].forceResize(children[i]._latestSize);
                        }
                    }
                }
            }
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            if (firstCall === true) {
                this.updateDisableStateForChildren();
            }
            return firstCall;
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            switch (propertyName) {
                case 'disabled':
                    this.updateDisableStateForChildren();
                    break;
                default:
                    break;
            }
        }
        updateDisableStateForChildren() {
            if (this.hasChildNodes()) {
                for (let i = 0; i < this.childNodes.length; ++i) {
                    if (NI_SUPPORT.isElement(this.childNodes[i])) {
                        this.childNodes[i].disabled = this.disabled;
                    }
                }
            }
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(LayoutPanel);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(LayoutPanel.prototype, 'ni-layout-panel', 'HTMLNILayoutPanel');
    NationalInstruments.HtmlVI.Elements.LayoutPanel = LayoutPanel;
}());
//# sourceMappingURL=ni-layout-panel.js.map