"use strict";
//****************************************
// INIElement Interface
// National Instruments Copyright 2019
//****************************************
(function () {
    'use strict';
    const NIElementSymbol = Symbol('NIElementSymbol');
    class INIElement {
        static get NIElementSymbol() {
            return NIElementSymbol;
        }
        static isNIElement(element) {
            return typeof element === 'object' &&
                element !== null &&
                element[NIElementSymbol] === true;
        }
    }
    NationalInstruments.HtmlVI.Elements.INIElement = INIElement;
})();
//# sourceMappingURL=ni-element-interface.js.map