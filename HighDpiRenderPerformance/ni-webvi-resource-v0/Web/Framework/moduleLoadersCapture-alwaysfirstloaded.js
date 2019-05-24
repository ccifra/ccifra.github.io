"use strict";
//****************************************
// Module Loaders Capture
// National Instruments Copyright 2018
// Usage: Some of our dependencies (jquery, polyfills, vireo, etc) use the UMD module pattern.
// This pattern makes it so that during load if those files detect either amd or commonjs modules being used
//      they will not create a global variable and use the module system instead.
// We rely on global variables for third party resources so this behavior is problematic during load.
// This file and it's corresponding restore file bookend the loading of all of our JS resources.
// At the start we save and unset window references to JS based module systems and at the end of loading we restore them.
//****************************************
(function () {
    'use strict';
    window.NationalInstruments = window.NationalInstruments || {};
    const savedModuleLoaders = {
        module: window.module,
        define: window.define // AMD modules (via require.js include)
    };
    Object.keys(savedModuleLoaders).forEach(name => {
        try {
            window[name] = undefined;
        }
        catch (ex) {
            // Swallow exception and log and continue best effort load if mutating globals errors
            window.console.error(ex);
        }
    });
    window.NationalInstruments.savedModuleLoaders = savedModuleLoaders;
}());
//# sourceMappingURL=moduleLoadersCapture-alwaysfirstloaded.js.map