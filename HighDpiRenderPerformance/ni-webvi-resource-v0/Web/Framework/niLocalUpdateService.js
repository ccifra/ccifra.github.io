"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//**********************************************************
// Service that handles interaction with Vireo
// National Instruments Copyright 2014
//**********************************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const VIREO_STATIC_HELPERS = NationalInstruments.HtmlVI.VireoStaticHelpers;
    const VIREO_PEEKER = NationalInstruments.HtmlVI.VireoPeeker;
    const VIREO_POKER = NationalInstruments.HtmlVI.VireoPoker;
    const CommonEventIdConstants = NationalInstruments.HtmlVI.CommonEventIdConstants;
    const EDITOR_ADAPTERS = NationalInstruments.HtmlVI.NIEditorDataAdapters;
    const stateEnum = Object.freeze(Object.assign({}, NationalInstruments.HtmlVI.WebApplicationStates.ServiceStateEnum, {
        DOWNLOADING: 'DOWNLOADING',
        SYNCHRONIZING: 'SYNCHRONIZING',
        RUNNING: 'RUNNING',
        STOPPING: 'STOPPING'
    }));
    const initTasksEnum = Object.freeze(Object.assign({}, NationalInstruments.HtmlVI.UpdateService.InitTasksEnum, {
        DOWNLOADING: 'DOWNLOADING',
        VIREOLOADED: 'VIREOLOADED'
    }));
    const accessModesEnum = Object.freeze({
        READ_ONLY: 'readOnly',
        WRITE_ONLY: 'writeOnly',
        READ_WRITE: 'readWrite'
    });
    const browserMessagesEnum = Object.freeze({
        DIAGRAM_VALUE_CHANGED: 'DiagramValueChanged',
        FINISHED_SENDING_UPDATES: 'FinishedSendingUpdates',
        READY_FOR_UPDATES: 'ReadyForUpdates',
        ABORT_VI: 'AbortVI',
        FINISHED_RUNNING: 'FinishedRunning',
        PANEL_CONTROL_CHANGED: 'PanelControlChanged',
        START: 'Start',
        DOCUMENT_READY: 'DocumentReady',
        UPDATE_SERVICE_STARTED: 'UpdateServiceStarted',
        PROCESS_INTERNAL_EVENT: 'ProcessInternalEvent',
        LOG_ERROR: 'LogError'
    });
    const MAXIMUM_VIREO_EXECUTION_TIME_MS = 4;
    const SLICE_SETS_PER_TIME_CHECK = 10000;
    class LocalUpdateService extends NationalInstruments.HtmlVI.UpdateService {
        // Constructor Function
        constructor(config) {
            super(); // super(config);
            // Public Instance Properties
            this.vireo = undefined;
            this.vireoTimer = undefined;
            this.syncControlsCache = {};
            this.propertyTypesCache = {};
            this.vireoSource = config.vireoSource;
            this.wasmUrl = config.wasmUrl;
            this.ideMode = config.runningInIDE === true;
            this.vireoText = undefined;
            this.dataItemCache = undefined;
            this.eventRegistrationService = new NationalInstruments.HtmlVI.NIEventRegistrationService();
            this.eventDataWriter = undefined;
            this.maximumErrorMessageCount = config.maximumErrorMessageCount;
            this.consoleLogErrorCount = 0;
            // References to callbacks registered to browser so they can be unregistered later
            this.windowEngineCallbacks = {
                start: undefined,
                diagramValueChanged: undefined,
                finishedSendingUpdates: undefined,
                abortVI: undefined
            };
            // Private Instance Properties
            this._updateHTMLControlsTimer = undefined;
        }
        static get StateEnum() {
            return stateEnum;
        }
        static get InitTasksEnum() {
            return initTasksEnum;
        }
        static get AccessModesEnum() {
            return accessModesEnum;
        }
        static get BrowserMessagesEnum() {
            return browserMessagesEnum;
        }
        // Static private
        static reportFailedToLoadVireoSource() {
            const element = document.getElementById('ni-failed-to-load-vireo-source');
            if (element !== null) {
                // It would be preferable to add or remove a class from the element instead
                // However since this case is trying to handle failed network conditions it is possible css, etc, fails to load as well
                // So setting as inline style to reduce external dependencies for showing this message
                element.style.display = 'block';
            }
        }
        // Static private
        static hasReadAccessor(localBindingInfo) {
            return localBindingInfo.accessMode === ACCESS_MODES.READ_ONLY || localBindingInfo.accessMode === ACCESS_MODES.READ_WRITE;
        }
        // Static private
        static hasWriteAccessor(localBindingInfo) {
            return localBindingInfo.accessMode === ACCESS_MODES.WRITE_ONLY || localBindingInfo.accessMode === ACCESS_MODES.READ_WRITE;
        }
        // Static private
        static controlCanTriggerValueChange(controlModel) {
            // Only Top level controls trigger value change; containers (cluster and array) are responsible for their children
            // Only controls (inputs) and controls with both read/write terminals can trigger value changes.
            return controlModel.isTopLevelAndPlacedAndEnabled() && LocalUpdateService.hasReadAccessor(controlModel.getLocalBindingInfo());
        }
        // Static private
        static controlCanTriggerEvent(controlModel) {
            // Only statically created controls that have a localBindingInfo during page generation. ie cursors created at runtime are ignored
            // Only Top level controls trigger value change; containers (cluster and array) are responsible for their children
            return controlModel.getLocalBindingInfo() !== undefined && controlModel.isDataItemBoundControl();
        }
        static controlAcceptsDiagramUpdates(controlModel) {
            // Only update Top level controls; containers (cluster and array) are responsible for their children
            // Only update indicators (outputs) and controls with both read/write terminals
            // Only update controls with latching enabled
            const localBindingInfo = controlModel.getLocalBindingInfo();
            return controlModel.isTopLevelAndPlacedAndEnabled() && (LocalUpdateService.hasWriteAccessor(localBindingInfo) || localBindingInfo.isLatched === true);
        }
        /**
         * Iterates through all control models in all VI models in the current web application.
         * Stops if callback returns a value different than 'undefined' and returns that value.
         * @param {Array} viModels - The VI models to scan. Typically localUpdateService.getVIModels().
         * @param {function} callback - Function to call with each control model and its correspondent owner VI model.
         * @returns {Object} returnVal - The obejct returned in the callback or undefined if none was returned.
         * @private
         */
        static forEachControlModelInEachVIModel(viModels, callback) {
            let viName, viModel, controlModels, controlId, controlModel, returnVal;
            for (viName in viModels) {
                if (viModels.hasOwnProperty(viName)) {
                    viModel = viModels[viName];
                    controlModels = viModel.getAllControlModels();
                    for (controlId in controlModels) {
                        if (controlModels.hasOwnProperty(controlId)) {
                            controlModel = controlModels[controlId];
                            returnVal = callback(viModel, controlModel);
                            if (returnVal !== undefined) {
                                return returnVal;
                            }
                        }
                    }
                }
            }
            return undefined;
        }
        /**
         * Tries to find a html control given a front-panel id (Data item) and returns a
         * string used for debugging that contains information about that control
         * @param {string} fpId - Front panel id (Data Item)
         * @param {Array} viModels - The VI models to scan
         * @private
         */
        static getControlDebuggingInfo(fpId, viModels) {
            let result;
            try {
                result = LocalUpdateService.forEachControlModelInEachVIModel(viModels, function (viModel, controlModel) {
                    let additionalErrorInfo;
                    const localBindingInfo = controlModel.getLocalBindingInfo();
                    if (localBindingInfo !== undefined && localBindingInfo.dataItem === fpId) {
                        additionalErrorInfo = `id=${controlModel.niControlId}, acceptsDiagramUpdates=${LocalUpdateService.controlAcceptsDiagramUpdates(controlModel)}, ` +
                            `sync=${localBindingInfo.sync}, isDataItemBoundControl=${controlModel.isDataItemBoundControl()}, `;
                        if (localBindingInfo === undefined) {
                            additionalErrorInfo += 'localBindingInfo=undefined';
                        }
                        else {
                            additionalErrorInfo += `localBindingInfo.unplacedOrDisabled=${localBindingInfo.unplacedOrDisabled}, localbindingInfo.isLatched=${localBindingInfo.isLatched}, hasWriteAccessor=${LocalUpdateService.hasWriteAccessor(localBindingInfo)}`;
                        }
                        return additionalErrorInfo;
                    }
                    return undefined;
                });
            }
            catch (ex) {
                result = 'Unable to evaluate control debugging info';
            }
            return result === undefined ? 'Data item does not exist' : result;
        }
        // Public Prototype Methods
        isValidServiceState(state) {
            // Child states merged with parent states so only need to check child
            const isValidState = SERVICE_STATE_ENUM[state] !== undefined;
            return isValidState;
        }
        isInIdeMode() {
            return this.ideMode;
        }
        // Functions for State transitions
        initialize() {
            const initTaskTracker = super.initialize(SERVICE_STATE_ENUM.UNINITIALIZED, INIT_TASKS_ENUM), that = this;
            // Change state prior to starting download
            // The crossDomain: true setting is to prevent jquery from adding the X-Requested-With header which changes the XHR request from a simple CORS request
            // to a CORS request with a preflight. This fails for some CDNs that redirect requests to a different domain (ie rawgit.com -> raw.githubusercontent.com)
            fetch(that.vireoSource, {
                method: 'GET',
                mode: 'cors',
                credentials: 'same-origin',
                redirect: 'follow'
            }).then(function (response) {
                if (!response.ok) {
                    throw new Error(`Invalid status: ${response.status}`);
                }
                return response.text();
            }).then(function (vireoText) {
                that.vireoText = vireoText;
                initTaskTracker.complete(INIT_TASKS_ENUM.DOWNLOADING);
            }).catch(function (ex) {
                NI_SUPPORT.error(`Error retrieving vireo source from url (${that.vireoSource}), additional information: ${ex.message})`);
                LocalUpdateService.reportFailedToLoadVireoSource();
                that.setServiceState(SERVICE_STATE_ENUM.ERROR);
            });
            VIREO_STATIC_HELPERS.whenVireoLoaded(function (vireoInstance) {
                that.vireo = vireoInstance;
                initTaskTracker.complete(INIT_TASKS_ENUM.VIREOLOADED);
            }, that.wasmUrl);
            that.setServiceState(SERVICE_STATE_ENUM.DOWNLOADING);
        }
        lookupLocalBindingInfo(viName, controlId) {
            const viModels = this.getVIModels();
            const viModel = viModels[viName];
            const controlModel = viModel.getControlModel(controlId);
            const localBindingInfo = controlModel.getLocalBindingInfo();
            if (localBindingInfo === undefined) {
                return undefined;
            }
            const valueRef = this.vireo.eggShell.findValueRef(localBindingInfo.encodedVIName, localBindingInfo.runtimePath);
            if (valueRef === undefined) {
                return undefined;
            }
            return localBindingInfo;
        }
        finishInitializing() {
            super.finishInitializing(SERVICE_STATE_ENUM.DOWNLOADING);
            const that = this;
            that.vireo.coreHelpers.setFPSyncFunction(function (fpId) {
                that.updateSyncHTMLControl(fpId);
            });
            const setObjectReferenceInvalidError = function (jsAPI) {
                jsAPI.setLabVIEWError(true, 1055, NI_SUPPORT.i18n('msg_INVALID_OBJECT_REFERENCE'));
            };
            const FALSE = 0;
            const TRUE = 1;
            that.vireo.javaScriptInvoke.registerInternalFunctions({
                ControlReference_GetControlObject: function (jsControlRefnumValueRef, viNameValueRef, idValueRef) {
                    const viName = that.vireo.eggShell.readString(viNameValueRef);
                    const controlId = that.vireo.eggShell.readDouble(idValueRef);
                    const viModels = that.getVIModels(); // gets all top level VI models
                    const viModel = viModels[viName];
                    if (!(viModel instanceof NationalInstruments.HtmlVI.Models.VirtualInstrumentModel)) {
                        return;
                    }
                    const controlViewModel = viModel.getControlViewModel(controlId);
                    that.vireo.eggShell.writeJavaScriptRefNum(jsControlRefnumValueRef, controlViewModel);
                },
                PropertyNode_PropertyRead: function (returnValueRef, jsControlRefnumValueRef, propertyNameValueRef, jsAPI) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const controlViewModel = that.vireo.eggShell.readJavaScriptRefNum(jsControlRefnumValueRef);
                        if (controlViewModel === undefined || !('getGPropertyValue' in controlViewModel)) {
                            setObjectReferenceInvalidError(jsAPI);
                            return;
                        }
                        const propertyName = that.vireo.eggShell.readString(propertyNameValueRef);
                        try {
                            let result = yield controlViewModel.getGPropertyValue(propertyName);
                            const controlModel = controlViewModel.model;
                            if (controlModel.shouldUpdateTerminal(propertyName)) {
                                const localBindingInfo = controlModel.getLocalBindingInfo();
                                // if property requires also updating terminal, we should read from vireo memory of that terminal.
                                result = VIREO_PEEKER.peek(that.vireo, localBindingInfo.encodedVIName, localBindingInfo.runtimePath);
                            }
                            VIREO_POKER.pokeValueRef(that.vireo, returnValueRef, result);
                        }
                        catch (error) {
                            // TODO: this needs to be removed with CAR 713926
                            jsAPI.setLabVIEWError(true, 1055, error.toString());
                        }
                    });
                },
                PropertyNode_PropertyWrite: function (ignoreReturnValueRef, jsControlRefnumValueRef, propertyNameValueRef, valueValueRef, jsAPI) {
                    const controlViewModel = that.vireo.eggShell.readJavaScriptRefNum(jsControlRefnumValueRef);
                    if (controlViewModel === undefined || !('setGPropertyValue' in controlViewModel)) {
                        setObjectReferenceInvalidError(jsAPI);
                        return;
                    }
                    const propertyName = that.vireo.eggShell.readString(propertyNameValueRef);
                    const value = VIREO_PEEKER.peekValueRef(that.vireo, valueValueRef);
                    try {
                        controlViewModel.setGPropertyValue(propertyName, value);
                    }
                    catch (error) {
                        jsAPI.setLabVIEWError(true, 1055, error.toString());
                        return;
                    }
                    const controlModel = controlViewModel.model;
                    if (controlModel.shouldUpdateTerminal(propertyName)) {
                        // if property requires also updating terminal, we should write to vireo memory of that terminal.
                        const localBindingInfo = controlModel.getLocalBindingInfo();
                        VIREO_POKER.poke(that.vireo, localBindingInfo.encodedVIName, localBindingInfo.runtimePath, value);
                    }
                },
                OneButtonDialog: function (returnValueRef, messageTextValueRef, textOneValueRef) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const messageText = that.vireo.eggShell.readString(messageTextValueRef);
                        const textOne = that.vireo.eggShell.readString(textOneValueRef);
                        yield window.HTMLNIDialog.createOneButtonDialog(messageText, textOne);
                        // Ignores the return value of the dialog, LabVIEW always returns true despite what was returned.
                        that.vireo.eggShell.writeDouble(returnValueRef, TRUE);
                    });
                },
                TwoButtonDialog: function (returnValueRef, messageTextValueRef, textOneValueRef, textTwoValueRef) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const messageText = that.vireo.eggShell.readString(messageTextValueRef);
                        const textOne = that.vireo.eggShell.readString(textOneValueRef);
                        const textTwo = that.vireo.eggShell.readString(textTwoValueRef);
                        const userAction = yield window.HTMLNIDialog.createTwoButtonDialog(messageText, textOne, textTwo);
                        // Only writes true if button one was selected. If the dialog is closed or button two is selected LabVIEW returns false.
                        const result = userAction === window.HTMLNIDialog.BUTTON_ONE_ACTION ? TRUE : FALSE;
                        that.vireo.eggShell.writeDouble(returnValueRef, result);
                    });
                },
                LogLabVIEWError: function (ignoreReturnValueRef, statusValueRef, codeValueRef, sourceValueRef) {
                    const code = that.vireo.eggShell.readDouble(codeValueRef);
                    const source = that.vireo.eggShell.readString(sourceValueRef);
                    if (that.consoleLogErrorCount < that.maximumErrorMessageCount) {
                        NI_SUPPORT.error(NI_SUPPORT.i18n('msg_CONSOLE_LOG_ERROR', code, source));
                    }
                    else if (that.consoleLogErrorCount === that.maximumErrorMessageCount) {
                        NI_SUPPORT.error(NI_SUPPORT.i18n('msg_REACHED_MAX_CONSOLE_LOG_ERRORS', that.maximumErrorMessageCount));
                    }
                    that.consoleLogErrorCount++;
                },
                InvokeControlFunction: function (returnValueRef, jsControlRefnumValueRef, functionNameValueRef, functionArgValueRef, jsAPI) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const controlViewModel = that.vireo.eggShell.readJavaScriptRefNum(jsControlRefnumValueRef);
                        if (controlViewModel === undefined) {
                            setObjectReferenceInvalidError(jsAPI);
                            return;
                        }
                        const methodName = that.vireo.eggShell.readString(functionNameValueRef);
                        // TODO: Task 120177 - Enhance this method to support arbitrary number of parameters. Currently only one string parameter is supported.
                        const args = that.vireo.eggShell.readString(functionArgValueRef);
                        try {
                            const result = yield controlViewModel.invokeInternalControlFunction(methodName, args);
                            if (result !== undefined) {
                                VIREO_POKER.pokeValueRef(that.vireo, returnValueRef, result);
                            }
                        }
                        catch (error) {
                            // TODO: this needs to be removed with CAR 713926
                            jsAPI.setLabVIEWError(true, 1055, error.toString());
                        }
                    });
                }
            });
            that.vireo.eggShell.setPrintFunction(function (text) {
                NI_SUPPORT.debug(text + '\n');
            });
            that.vireo.eggShell.setPrintErrorFunction(function (text) {
                NI_SUPPORT.debug(text + '\n');
            });
            that.vireo.propertyNode.setPropertyReadFunction(function (controlRefVIName, controlId, propertyName, tempVarValueRef) {
                let propertyValue, localBindingInfo;
                const viName = window.vireoHelpers.staticHelpers.decodeIdentifier(controlRefVIName);
                if (!isNaN(controlId)) {
                    const controlModel = that.getVIModels()[viName].getControlModel(controlId);
                    if (controlModel.shouldUpdateTerminal(propertyName)) {
                        localBindingInfo = that.lookupLocalBindingInfo(viName, controlId);
                        propertyValue = VIREO_PEEKER.peek(that.vireo, localBindingInfo.encodedVIName, localBindingInfo.runtimePath);
                    }
                    else {
                        propertyValue = that.getGPropertyValue(viName, controlId, propertyName);
                    }
                    VIREO_POKER.pokeValueRef(that.vireo, tempVarValueRef, propertyValue);
                }
                else {
                    throw new Error('Could not find control with control id: ' + controlId + ' in vi: ' + viName);
                }
            });
            that.vireo.propertyNode.setPropertyWriteFunction(function (controlRefVIName, controlId, propertyName, tempVarValueRef) {
                let propertyValue, localBindingInfo;
                const viName = window.vireoHelpers.staticHelpers.decodeIdentifier(controlRefVIName);
                if (!isNaN(controlId)) {
                    propertyValue = VIREO_PEEKER.peekValueRef(that.vireo, tempVarValueRef);
                    that.setGPropertyValue(viName, controlId, propertyName, propertyValue);
                    const controlModel = that.getVIModels()[viName].getControlModel(controlId);
                    if (controlModel.shouldUpdateTerminal(propertyName)) {
                        localBindingInfo = that.lookupLocalBindingInfo(viName, controlId);
                        VIREO_POKER.poke(that.vireo, localBindingInfo.encodedVIName, localBindingInfo.runtimePath, propertyValue);
                    }
                }
                else {
                    throw new Error('Could not find control with control id: ' + controlId + ' in vi: ' + viName);
                }
            });
            that.vireo.eventHelpers.setRegisterForControlEventsFunction(function (viName, controlId, eventId, eventOracleIndex) {
                that.eventRegistrationService.registerForControlEvents(viName, controlId, eventId, eventOracleIndex);
            });
            that.vireo.eventHelpers.setUnRegisterForControlEventsFunction(function (viName, controlId, eventId, eventOracleIndex) {
                that.eventRegistrationService.unRegisterForControlEvents(viName, controlId, eventId, eventOracleIndex);
            });
            that.vireo.eggShell.setExecuteSlicesWakeUpCallback(function () {
                if (that.checkServiceStateIs(SERVICE_STATE_ENUM.RUNNING)) {
                    window.clearTimeout(that.vireoTimer);
                    that.vireoTimer = undefined;
                    that.executeVireoRuntime();
                }
            });
            that.dataItemCache = new NationalInstruments.HtmlVI.ControlDataItemCache(that.getVIModels());
            that.eventDataWriter = function (valueRef, eventData) {
                VIREO_POKER.pokeValueRef(that.vireo, valueRef, eventData);
            };
            if (that.ideMode === true) {
                window.engine.call(BROWSER_MESSAGE_ENUM.DOCUMENT_READY);
            }
            that.setServiceState(SERVICE_STATE_ENUM.READY);
        }
        start() {
            super.start(SERVICE_STATE_ENUM.READY);
            const that = this;
            that.vireo.eggShell.loadVia(that.vireoText);
            if (that.ideMode === true) {
                window.engine.off(BROWSER_MESSAGE_ENUM.START, that.windowEngineCallbacks.start);
                that.windowEngineCallbacks.start = undefined;
                setTimeout(function () {
                    that.synchronize();
                }, 0);
                that.setServiceState(SERVICE_STATE_ENUM.SYNCHRONIZING);
            }
            else {
                that.startVireoRuntime();
            }
        }
        synchronize() {
            const that = this;
            let i;
            that.verifyServiceStateIs(SERVICE_STATE_ENUM.SYNCHRONIZING);
            if (that.ideMode === false) {
                NI_SUPPORT.error('HTML Panel synchronization steps should only be run when inside the editor');
                that.setServiceState(SERVICE_STATE_ENUM.ERROR);
                return;
            }
            // Create list of VIs to sync
            const remainingVIsToSync = Object.keys(that.getVIModels());
            // Create property update listener
            that.windowEngineCallbacks.diagramValueChanged = function (argsArr) {
                // Browser message will identify the control by its C# data item name and a property called 'value'
                // but HTML panel update message needs control to be identified by control ID and a specific property name for each model.
                const viName = argsArr[0], dataItem = argsArr[1], editorRuntimeBindingInfo = that.dataItemCache.getEditorRuntimeBindingInfo(viName, dataItem), controlId = editorRuntimeBindingInfo.controlId, dataJSON = argsArr[2], parsedData = JSON.parse(dataJSON), data = {};
                data[editorRuntimeBindingInfo.prop] = parsedData;
                that.dispatchMessageToHTMLPanel(viName, controlId, data, EDITOR_ADAPTERS.editorToJsModel);
            };
            // create VI panel complete listener
            that.windowEngineCallbacks.finishedSendingUpdates = function (argsArr) {
                let i;
                const viName = argsArr[0];
                for (i = 0; i < remainingVIsToSync.length; i = i + 1) {
                    if (remainingVIsToSync[i] === viName) {
                        remainingVIsToSync.splice(i, 1);
                        break;
                    }
                }
                if (remainingVIsToSync.length === 0) {
                    window.engine.off(BROWSER_MESSAGE_ENUM.DIAGRAM_VALUE_CHANGED, that.windowEngineCallbacks.diagramValueChanged);
                    window.engine.off(BROWSER_MESSAGE_ENUM.FINISHED_SENDING_UPDATES, that.windowEngineCallbacks.finishedSendingUpdates);
                    that.windowEngineCallbacks.diagramValueChanged = undefined;
                    that.windowEngineCallbacks.finishedSendingUpdates = undefined;
                    that.startVireoRuntime();
                }
            };
            window.engine.on(BROWSER_MESSAGE_ENUM.DIAGRAM_VALUE_CHANGED, that.windowEngineCallbacks.diagramValueChanged);
            window.engine.on(BROWSER_MESSAGE_ENUM.FINISHED_SENDING_UPDATES, that.windowEngineCallbacks.finishedSendingUpdates);
            this.registerPageNavigationListener();
            // Send requests for VI updates
            for (i = 0; i < remainingVIsToSync.length; i = i + 1) {
                window.engine.trigger(BROWSER_MESSAGE_ENUM.READY_FOR_UPDATES, remainingVIsToSync[i]);
            }
        }
        startVireoRuntime() {
            const that = this;
            that.verifyServiceStateIs([SERVICE_STATE_ENUM.READY, SERVICE_STATE_ENUM.SYNCHRONIZING]);
            if (that.ideMode === true) {
                that.windowEngineCallbacks.abortVI = function () {
                    that.stop();
                };
                window.engine.on(BROWSER_MESSAGE_ENUM.ABORT_VI, that.windowEngineCallbacks.abortVI);
            }
            setTimeout(function () {
                that.loadCurrentControlValuesIntoRuntime();
                that.executeVireoRuntime();
                that.scheduleUpdateHTMLControls();
            }, 0);
            that.setServiceState(SERVICE_STATE_ENUM.RUNNING);
            if (that.ideMode === true) {
                window.engine.call(BROWSER_MESSAGE_ENUM.UPDATE_SERVICE_STARTED);
            }
        }
        executeVireoRuntime() {
            const that = this;
            let execSlicesResult = 0;
            if (that.checkServiceStateIs(SERVICE_STATE_ENUM.RUNNING)) {
                try {
                    execSlicesResult = that.vireo.eggShell.executeSlicesUntilWait(SLICE_SETS_PER_TIME_CHECK, MAXIMUM_VIREO_EXECUTION_TIME_MS);
                }
                catch (ex) {
                    // Some browsers do not print the message in the stack so print both
                    const errorMessage = `Vireo Failed to execute. Message: ${ex.message}, Stack: ${ex.stack}`;
                    if (that.ideMode === true) {
                        window.engine.trigger(BROWSER_MESSAGE_ENUM.LOG_ERROR, errorMessage);
                    }
                    NI_SUPPORT.error(errorMessage);
                }
                if (execSlicesResult > 0) {
                    that.vireoTimer = setTimeout(that.executeVireoRuntime.bind(that), execSlicesResult);
                }
                else if (execSlicesResult < 0) {
                    that.vireoTimer = setTimeout(that.executeVireoRuntime.bind(that), 0);
                }
                else {
                    window.clearTimeout(that.vireoTimer);
                    that.vireoTimer = undefined;
                    that.stop();
                    setTimeout(that.executeVireoRuntime.bind(that), 0);
                }
            }
            else if (that.checkServiceStateIs(SERVICE_STATE_ENUM.STOPPING)) {
                setTimeout(function () {
                    that.finishStopping();
                }, 0);
            }
            else {
                NI_SUPPORT.error('Web Application expected to be RUNNING or STOPPING');
                that.setServiceState(SERVICE_STATE_ENUM.ERROR);
            }
        }
        scheduleUpdateHTMLControls() {
            const that = this;
            if (that.checkServiceStateIs(SERVICE_STATE_ENUM.RUNNING) === false) {
                return;
            }
            // First schedule reading from controls during each requestAnimationFrame
            // This makes sure we are not reading from controls faster than a frame renders
            requestAnimationFrame(function () {
                that.scheduleUpdateHTMLControls();
            });
            if (that._updateHTMLControlsTimer !== undefined) {
                return;
            }
            // Second we don't want to do the actual work of reading data from vireo in rAF
            // So we schedule the work to run as soon as possible after rAF
            that._updateHTMLControlsTimer = setTimeout(function () {
                that._updateHTMLControlsTimer = undefined;
                if (that.checkServiceStateIs(SERVICE_STATE_ENUM.RUNNING) === false) {
                    return;
                }
                that.updateHTMLControls();
            }, 0);
        }
        stop() {
            super.stop(SERVICE_STATE_ENUM.RUNNING);
            if (this.ideMode === true) {
                window.engine.off(BROWSER_MESSAGE_ENUM.ABORT_VI, this.windowEngineCallbacks.abortVI);
                this.windowEngineCallbacks.abortVI = undefined;
            }
            this.setServiceState(SERVICE_STATE_ENUM.STOPPING);
        }
        finishStopping() {
            const that = this;
            this.verifyServiceStateIs(SERVICE_STATE_ENUM.STOPPING);
            // Make sure the latest control values are retrieved before completely stopping
            this.updateHTMLControls();
            if (this.ideMode === true) {
                // Send control values back to editor.
                // TODO: We should probably do this during run, not just at the end of run.
                // This would be necessary for the C# data context to remain up to date so that features
                // like Capture Data work correctly
                this.sendControlValuesToEditor();
                window.engine.trigger(BROWSER_MESSAGE_ENUM.FINISHED_RUNNING, 'Function');
                this.windowEngineCallbacks.start = function () {
                    that.start();
                };
                window.engine.on(BROWSER_MESSAGE_ENUM.START, that.windowEngineCallbacks.start);
            }
            this.unregisterPageNavigationListener();
            this.setServiceState(SERVICE_STATE_ENUM.READY);
        }
        // Functions for service <-> MVVM interconnect
        // Called by the WebAppModel
        controlChanged(_viModel, controlModel, _propertyName, newValue, oldValue) {
            if (this.checkServiceStateIs(SERVICE_STATE_ENUM.RUNNING) === false) {
                return;
            }
            const localBindingInfo = controlModel.getLocalBindingInfo();
            if (LocalUpdateService.controlCanTriggerValueChange(controlModel)) {
                VIREO_POKER.poke(this.vireo, localBindingInfo.encodedVIName, localBindingInfo.runtimePath, newValue);
            }
            if (LocalUpdateService.controlCanTriggerEvent(controlModel)) {
                const eventOracleIndex = this.eventRegistrationService.getEventOracleIndex(controlModel);
                if (this.eventRegistrationService.isControlRegisteredForEvent(localBindingInfo.encodedVIName, eventOracleIndex, NationalInstruments.HtmlVI.CommonEventIds.ValueChanged)) {
                    const valueChangedTypeName = window.vireoHelpers.staticHelpers.encodeIdentifier(CommonEventIdConstants.VALUE_CHANGED + "_" + controlModel.niControlId);
                    const typeValueRef = this.vireo.eggShell.findValueRef(localBindingInfo.encodedVIName, valueChangedTypeName);
                    const eventData = {
                        "Old Value": oldValue,
                        "New Value": newValue
                    };
                    this.vireo.eventHelpers.occurEvent(eventOracleIndex, controlModel.niControlId, NationalInstruments.HtmlVI.CommonEventIds.ValueChanged, this.eventDataWriter, typeValueRef, eventData);
                }
            }
        }
        // Called by the WebAppModel
        controlEventOccurred(viModel, controlModel, eventName, eventData) {
            const eventInfo = controlModel.getLocalEventInfo(eventName);
            // If we got undefined, then this event isn't handled by Vireo, so we won't attempt to call into it
            if (eventInfo !== undefined) {
                const eventOracleIndex = this.eventRegistrationService.getEventOracleIndex(controlModel);
                const viName = controlModel.getRoot().getNameVireoEncoded();
                if (this.eventRegistrationService.isControlRegisteredForEvent(viName, eventOracleIndex, eventInfo.eventIndex)) {
                    const typeName = window.vireoHelpers.staticHelpers.encodeIdentifier(eventInfo.eventDataId + "_" + controlModel.niControlId);
                    const eventDataTemplateValueRef = this.vireo.eggShell.findValueRef(viName, typeName);
                    this.vireo.eventHelpers.occurEvent(eventOracleIndex, controlModel.niControlId, eventInfo.eventIndex, this.eventDataWriter, eventDataTemplateValueRef, eventData);
                }
            }
        }
        // Called by the WebAppModel
        internalControlEventOccurred(viModel, controlModel, eventName, eventData) {
            const data = {};
            data[eventName] = eventData;
            if (this.ideMode === true) {
                window.engine.trigger(BROWSER_MESSAGE_ENUM.PROCESS_INTERNAL_EVENT, viModel.viName, controlModel.niControlId, JSON.stringify(data));
            }
        }
        sendControlValuesToEditor() {
            LocalUpdateService.forEachControlModelInEachVIModel(this.getVIModels(), function (viModel, controlModel) {
                let data, hbType;
                const bindingInfo = controlModel.getEditorRuntimeBindingInfo();
                // Currently we only send messages to the editor when values change on the page, not any other property.
                // Eventually we may want to send messages if the user changes other properties (e.g. by editing min/max in place)
                if (bindingInfo !== undefined && bindingInfo.dataItem !== undefined && bindingInfo.prop !== undefined &&
                    bindingInfo.dataItem !== '' && bindingInfo.prop !== '') {
                    if ('historyBuffer' in controlModel) {
                        data = controlModel.historyBuffer.toJSON();
                        hbType = controlModel.getHistoryBufferInnerType(controlModel.niType, data.width);
                        data.data = EDITOR_ADAPTERS.jsModelToEditor(data.data, hbType);
                    }
                    else {
                        data = controlModel[bindingInfo.prop];
                        if (controlModel.modelPropertyUsesNIType(bindingInfo.prop)) {
                            data = EDITOR_ADAPTERS.jsModelToEditor(data, controlModel.niType);
                        }
                    }
                    window.engine.trigger(BROWSER_MESSAGE_ENUM.PANEL_CONTROL_CHANGED, viModel.viName, bindingInfo.dataItem, JSON.stringify(data));
                }
            });
        }
        loadCurrentControlValuesIntoRuntime() {
            const that = this;
            LocalUpdateService.forEachControlModelInEachVIModel(that.getVIModels(), function (viModel, controlModel) {
                let data;
                const localBindingInfo = controlModel.getLocalBindingInfo();
                if (controlModel.isTopLevelAndPlacedAndEnabled()) {
                    data = controlModel[localBindingInfo.prop];
                    if (data !== undefined) {
                        VIREO_POKER.poke(that.vireo, localBindingInfo.encodedVIName, localBindingInfo.runtimePath, data);
                    }
                }
            });
        }
        updateHTMLControls() {
            const that = this;
            LocalUpdateService.forEachControlModelInEachVIModel(that.getVIModels(), function (viModel, controlModel) {
                let messageData, peekResult;
                const localBindingInfo = controlModel.getLocalBindingInfo();
                if (LocalUpdateService.controlAcceptsDiagramUpdates(controlModel) && localBindingInfo.sync === false) {
                    messageData = {};
                    peekResult = VIREO_PEEKER.peek(that.vireo, localBindingInfo.encodedVIName, localBindingInfo.runtimePath);
                    messageData[localBindingInfo.prop] = peekResult;
                    that.dispatchMessageToHTMLPanel(viModel.viName, controlModel.niControlId, messageData);
                }
            });
        }
        /* Tries to find a html control given a front-panel id (Data item) and returns an
         * object containing its localBindingInfo, owner viName, and controlId.
         * @param {string} fpId - Front panel id (Data Item)
         */
        findSyncHTMLControl(fpId) {
            return LocalUpdateService.forEachControlModelInEachVIModel(this.getVIModels(), function (viModel, controlModel) {
                const localBindingInfo = controlModel.getLocalBindingInfo();
                if (LocalUpdateService.controlAcceptsDiagramUpdates(controlModel) && localBindingInfo.dataItem === fpId && localBindingInfo.sync === true) {
                    return {
                        localBindingInfo: localBindingInfo,
                        viName: viModel.viName,
                        controlId: controlModel.niControlId
                    };
                }
                return undefined;
            });
        }
        updateSyncHTMLControl(fpId) {
            let localBindingInfo, viName, controlId, messageData, peekResult;
            if (this.syncControlsCache[fpId] === undefined) {
                this.syncControlsCache[fpId] = this.findSyncHTMLControl(fpId);
            }
            if (this.syncControlsCache[fpId] !== undefined) {
                localBindingInfo = this.syncControlsCache[fpId].localBindingInfo;
                viName = this.syncControlsCache[fpId].viName;
                controlId = this.syncControlsCache[fpId].controlId;
                messageData = {};
                peekResult = VIREO_PEEKER.peek(this.vireo, localBindingInfo.encodedVIName, localBindingInfo.runtimePath);
                messageData[localBindingInfo.prop] = peekResult;
                this.dispatchMessageToHTMLPanel(viName, controlId, messageData);
            }
            else {
                // A known reason for a sync dataitem to not exist is that a chart is wired on the diagram but placed in the unplaced items tray of the front panel
                const additionalErrorInfo = LocalUpdateService.getControlDebuggingInfo(fpId, this.getVIModels());
                NI_SUPPORT.errorVerbose('Trying to update synchronous control with data item id ' + fpId + ' but failed to locate control. ' + additionalErrorInfo);
            }
        }
        /**
         * Sets the property of control model to the given value.
         * @param {string} viName - The name of VI.
         * @param {string} controlId - The control ID.
         * @param {string} gPropertyName - Name of property to be updated.
         * @param {string/number} gPropertyValue - Value of property.
         * @throws will throw if the VI, control or property is not found.
         */
        setGPropertyValue(viName, controlId, gPropertyName, gPropertyValue) {
            const that = this;
            const viModels = that.getVIModels();
            const viModel = viModels[viName];
            if (viModel !== undefined) {
                viModel.processControlUpdateToSetGPropertyValue(controlId, gPropertyName, gPropertyValue);
            }
            else {
                throw new Error('No VI found with name: ' + viName + ' to send control property update');
            }
        }
        /**
         * Gets the value of property of control.
         * @param {string} viName - The name of VI.
         * @param {string} controlId - The control ID.
         * @param {string} gPropertyName - Property name for which value is to be returned.
         * @returns {string/number} value of property.
         * @throws will throw if the VI, control or property is not found.
         */
        getGPropertyValue(viName, controlId, gPropertyName) {
            const that = this;
            const viModels = that.getVIModels();
            const viModel = viModels[viName];
            if (viModel !== undefined) {
                return viModel.processControlUpdateToGetGPropertyValue(controlId, gPropertyName);
            }
            else {
                throw new Error('No VI found with name: ' + viName + ' to get control property value');
            }
        }
    }
    NationalInstruments.HtmlVI.LocalUpdateService = LocalUpdateService;
    const SERVICE_STATE_ENUM = NationalInstruments.HtmlVI.LocalUpdateService.StateEnum;
    const INIT_TASKS_ENUM = NationalInstruments.HtmlVI.LocalUpdateService.InitTasksEnum;
    const BROWSER_MESSAGE_ENUM = NationalInstruments.HtmlVI.LocalUpdateService.BrowserMessagesEnum;
    const ACCESS_MODES = NationalInstruments.HtmlVI.LocalUpdateService.AccessModesEnum;
})();
//# sourceMappingURL=niLocalUpdateService.js.map