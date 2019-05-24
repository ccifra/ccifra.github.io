"use strict";
//****************************************
// Module Loaders Capture
// National Instruments Copyright 2018
// Usage: See the corresponding capture file for more details
//****************************************
(function () {
    'use strict';
    Object.keys(window.NationalInstruments.savedModuleLoaders).forEach(name => {
        try {
            window[name] = window.NationalInstruments.savedModuleLoaders[name];
        }
        catch (ex) {
            // Swallow exception and log and continue best effort load if mutating globals errors
            window.console.error(ex);
        }
        window.NationalInstruments.savedModuleLoaders[name] = undefined;
    });
}());
//# sourceMappingURL=moduleLoadersRestore-alwayslastloaded.js.map