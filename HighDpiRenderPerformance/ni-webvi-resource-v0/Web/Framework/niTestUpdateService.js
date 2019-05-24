"use strict";
//**********************************************************
// Service that handles interaction with Test Framework
// National Instruments Copyright 2014
//**********************************************************
(function () {
    'use strict';
    const stateEnum = Object.freeze(Object.assign({}, NationalInstruments.HtmlVI.WebApplicationStates.ServiceStateEnum, {
        INITIALIZING: 'INITIALIZING',
        RUNNING: 'RUNNING'
    }));
    class TestUpdateService extends NationalInstruments.HtmlVI.UpdateService {
        constructor() {
            super();
            this.windowCallbacks = {
                propertyChange: undefined,
                addElement: undefined,
                removeElement: undefined
            };
            this._isInIdeMode = false;
        }
        static get StateEnum() {
            return stateEnum;
        }
        setIdeMode(value) {
            this._isInIdeMode = value;
        }
        isInIdeMode() {
            return this._isInIdeMode;
        }
        isValidServiceState(state) {
            // Child states merged with parent states so only need to check child
            const isValidState = SERVICE_STATE_ENUM[state] !== undefined;
            return isValidState;
        }
        initialize() {
            super.initialize(SERVICE_STATE_ENUM.UNINITIALIZED, undefined);
            this.setServiceState(SERVICE_STATE_ENUM.INITIALIZING);
        }
        finishInitializing() {
            super.finishInitializing(SERVICE_STATE_ENUM.INITIALIZING);
            this.setServiceState(SERVICE_STATE_ENUM.READY);
        }
        start() {
            super.start(SERVICE_STATE_ENUM.READY);
            const that = this;
            // Events fired by the test async helpers
            // Switched from using event listeners to invoking directly. Reason is that events don't propagate exceptions on the
            // call stack which makes testing in jasmine very difficult: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
            that.windowCallbacks.propertyChange = function (viName, niControlId, data) {
                that.dispatchMessageToHTMLPanel(viName, niControlId, data);
            };
            that.windowCallbacks.addElement = function (modelSettings, tagName, niControlId, viRef, parentId) {
                // TODO mraj the tests should be updated to not include kind or extras in modelsettings
                const filteredModelSettings = {};
                let key;
                for (key in modelSettings) {
                    if (modelSettings.hasOwnProperty(key) && key !== 'kind') {
                        filteredModelSettings[key] = modelSettings[key];
                    }
                }
                const resultElements = NationalInstruments.HtmlVI.UpdateService.createNIControlToAddToDOM(filteredModelSettings, tagName, niControlId, viRef, parentId);
                if (resultElements.parentElement === undefined) {
                    throw new Error('Parent element must be defined for the test update service');
                }
                else {
                    resultElements.parentElement.appendChild(resultElements.controlElement);
                }
            };
            that.windowCallbacks.removeElement = function (niControlId, viRef) {
                const resultElements = NationalInstruments.HtmlVI.UpdateService.findNIControlToRemoveFromDOM(niControlId, viRef);
                resultElements.controlElement.parentNode.removeChild(resultElements.controlElement);
            };
            that.setServiceState(SERVICE_STATE_ENUM.RUNNING);
        }
        stop() {
            super.stop(SERVICE_STATE_ENUM.RUNNING);
            this.windowCallbacks.propertyChange = undefined;
            this.windowCallbacks.addElement = undefined;
            this.windowCallbacks.removeElement = undefined;
            this.setServiceState(SERVICE_STATE_ENUM.READY);
        }
    }
    NationalInstruments.HtmlVI.TestUpdateService = TestUpdateService;
    const SERVICE_STATE_ENUM = NationalInstruments.HtmlVI.TestUpdateService.StateEnum;
}());
//# sourceMappingURL=niTestUpdateService.js.map