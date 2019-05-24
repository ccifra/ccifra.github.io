"use strict";
//****************************************
// Front Panel Custom Element
// DOM Registration: No
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class FrontPanel extends NationalInstruments.HtmlVI.Elements.LayoutControl {
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(FrontPanel);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(FrontPanel.prototype, 'ni-front-panel', 'HTMLNIFrontPanel');
    NationalInstruments.HtmlVI.Elements.FrontPanel = FrontPanel;
}());
//# sourceMappingURL=ni-front-panel.js.map