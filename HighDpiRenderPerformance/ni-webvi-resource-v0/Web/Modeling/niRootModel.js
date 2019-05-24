"use strict";
//****************************************
// IRootModel Interface
// Interface to be implemented by Models which would be the ancestor of all other Models on the panel.
// National Instruments Copyright 2019
//****************************************
(function () {
    'use strict';
    const NIRootModelSymbol = Symbol('NIRootModelSymbol');
    class IRootModel {
        static get NIRootModelSymbol() {
            return NIRootModelSymbol;
        }
        static isRootModel(model) {
            return typeof model === 'object' &&
                model !== null &&
                model[NIRootModelSymbol] === true;
        }
    }
    NationalInstruments.HtmlVI.Models.IRootModel = IRootModel;
})();
//# sourceMappingURL=niRootModel.js.map