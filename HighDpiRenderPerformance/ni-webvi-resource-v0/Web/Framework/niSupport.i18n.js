"use strict";
//****************************************
// Support functions
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    // The i18n function will only be defined when language loading is resolved below
    NI_SUPPORT.i18n = undefined;
    NI_SUPPORT.InternationalizationInitializer = {};
    NI_SUPPORT.InternationalizationInitializer.TaskTrackerEnum = Object.freeze({
        LANGUAGES_LOADED: 'LANGUAGES_LOADED',
        ELEMENT_PROTOTYPES_READY: 'ELEMENT_PROTOTYPES_READY',
        WINDOW_LOADED: 'WINDOW_LOADED'
    });
    NI_SUPPORT.InternationalizationInitializer.TaskTracker = new NationalInstruments.HtmlVI.TaskTracker(NI_SUPPORT.InternationalizationInitializer.TaskTrackerEnum, function () {
        NationalInstruments.HtmlVI.ElementRegistrationService.completeRegistration();
        NationalInstruments.JQXElement._registerElements();
    });
    const I18N_INIT_ENUM = NI_SUPPORT.InternationalizationInitializer.TaskTrackerEnum;
    const I18N_INIT_TASK_TRACKER = NI_SUPPORT.InternationalizationInitializer.TaskTracker;
    const formatInternationalization = function (propertyName, replacements) {
        const propertyConfig = window.NationalInstruments.InternationalizationStrings[propertyName];
        if (propertyConfig === undefined) {
            return propertyName;
        }
        const substitutionLength = propertyConfig.substitutionIndexes.length;
        let result = propertyConfig.stringParts[0];
        for (let i = 0; i < substitutionLength; i++) {
            const substitutionIndex = propertyConfig.substitutionIndexes[i];
            const replacement = replacements[substitutionIndex];
            result += (replacement + propertyConfig.stringParts[i + 1]);
        }
        return result;
    };
    setTimeout(function () {
        NI_SUPPORT.i18n = function (propertyName, ...replacements) {
            return formatInternationalization(propertyName, replacements);
        };
        // Complete task after updating the i18n function so it can be used on completion
        I18N_INIT_TASK_TRACKER.complete(I18N_INIT_ENUM.LANGUAGES_LOADED);
    }, 0);
    // Elements that perform sizing in the attachedCallback require styles to be loaded
    // Running the element registration after the window loaded event lets us guarantee
    // styles have already been evaluated at the cost of non-visible elements being delayed
    // until the page has loaded.
    const windowLoadedCallback = function () {
        NI_SUPPORT.logVerbose('niSupport.i18n windowLoadedCallback()');
        I18N_INIT_TASK_TRACKER.complete(I18N_INIT_ENUM.WINDOW_LOADED);
    };
    NI_SUPPORT.logVerbose('niSupport.i18n readyState=' + document.readyState);
    if (document.readyState === 'complete') {
        windowLoadedCallback();
    }
    else {
        window.addEventListener('load', windowLoadedCallback);
    }
}());
//# sourceMappingURL=niSupport.i18n.js.map