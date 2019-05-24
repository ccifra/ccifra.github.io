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
// Service that handles interaction to a running non-Vireo VI in the editor
// National Instruments Copyright 2015
//**********************************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const EDITOR_ADAPTERS = NationalInstruments.HtmlVI.NIEditorDataAdapters;
    const stateEnum = Object.freeze(Object.assign({}, NationalInstruments.HtmlVI.WebApplicationStates.ServiceStateEnum, {
        INITIALIZING: 'INITIALIZING',
        LISTENING: 'LISTENING'
    }));
    const browserMessageEnum = Object.freeze({
        READY_FOR_UPDATES: 'ReadyForUpdates',
        PANEL_CONTROL_CHANGED: 'PanelControlChanged',
        DIAGRAM_VALUE_CHANGED: 'DiagramValueChanged',
        DOCUMENT_READY: 'DocumentReady',
        UPDATE_SERVICE_STARTED: 'UpdateServiceStarted',
        PANEL_CONTROL_EVENT_OCCURRED: 'PanelControlEventOccurred',
        PROCESS_INTERNAL_EVENT: 'ProcessInternalEvent',
        SET_CALL_RESPONSE: 'setCallResponse',
        BATCH_UPDATE: 'batchUpdate',
        SET_GPROPERTY_PROPERTY_VALUE: 'setGPropertyValue',
        GET_GPROPERTY_PROPERTY_VALUE: 'getGPropertyValue',
        GET_PACKED_GPROPERTY_PROPERTY_VALUE: 'getPackedGPropertyValue',
        GET_JSON_GPROPERTY_PROPERTY_VALUE: 'getJsonGPropertyValue',
        INVOKE_CONTROL_FUNCTION: 'invokeControlFunction'
    });
    class EditorRuntimeUpdateService extends NationalInstruments.HtmlVI.UpdateService {
        /* global browserMessaging:false */
        /* global flatbuffers:false */
        constructor() {
            super();
            // Public Instance Properties
            this.dataItemCache = undefined;
            this.enableEvents = true;
            this.windowEngineCallbacks = {
                diagramValueChanged: undefined,
                batchUpdate: undefined,
                setGPropertyValue: undefined,
                getGPropertyValue: undefined,
                getPackedGPropertyValue: undefined,
                getJsonGPropertyValue: undefined,
                invokeControlFunction: undefined
            };
            // Private Instance Properties
            this.responseArrays = {};
            this.responseBuffers = {};
        }
        isValidServiceState(state) {
            // Child states merged with parent states so only need to check child
            const isValidState = SERVICE_STATE_ENUM[state] !== undefined;
            return isValidState;
        }
        isInIdeMode() {
            return true;
        }
        // Functions for state transitions
        initialize() {
            super.initialize(SERVICE_STATE_ENUM.UNINITIALIZED, INIT_TASKS_ENUM);
            this.setServiceState(SERVICE_STATE_ENUM.INITIALIZING);
        }
        finishInitializing() {
            super.finishInitializing(SERVICE_STATE_ENUM.INITIALIZING);
            this.dataItemCache = new NationalInstruments.HtmlVI.ControlDataItemCache(this.getVIModels());
            this.setServiceState(SERVICE_STATE_ENUM.READY);
        }
        start() {
            super.start(SERVICE_STATE_ENUM.READY);
            const that = this;
            that.windowEngineCallbacks.diagramValueChanged = function (argsArr) {
                // Browser message will identify the control by its C# data item name and a property called 'value'
                // but HTML panel update message needs control to be identified by control ID and a specific property name for each model.
                const viName = argsArr[0];
                const dataItem = argsArr[1];
                const editorRuntimeBindingInfo = that.dataItemCache.getEditorRuntimeBindingInfo(viName, dataItem);
                const controlId = editorRuntimeBindingInfo.controlId;
                const dataJSON = argsArr[2];
                const parsedData = JSON.parse(dataJSON);
                const data = {};
                data[editorRuntimeBindingInfo.prop] = parsedData;
                that.dispatchMessageToHTMLPanel(viName, controlId, data, EDITOR_ADAPTERS.editorToJsModel);
            };
            that.windowEngineCallbacks.batchUpdate = function (args) {
                return __awaiter(this, void 0, void 0, function* () {
                    const cookie = args[0];
                    try {
                        const position = args[1];
                        const length = args[2];
                        const newValueKey = args[3];
                        const newValueName = args[4];
                        const response = browserMessaging.getSharedData(newValueKey, newValueName);
                        const view = new Uint8Array(response, position, length - position);
                        const buffer = new flatbuffers.ByteBuffer(view);
                        const batch = NationalInstruments.Web.Interop.Batch.getRootAsBatch(buffer);
                        const numItems = batch.itemsLength();
                        const viName = batch.docName();
                        for (let x = 0; x < numItems; ++x) {
                            const batchItem = batch.items(x);
                            const updateType = batchItem.dataType();
                            if (updateType === NationalInstruments.Web.Interop.UpdateData.BatchUpdateFromBuffer) {
                                that.batchUpdateFromBuffer(batchItem, viName);
                            }
                            else if (updateType === NationalInstruments.Web.Interop.UpdateData.BatchUpdateFromOffset) {
                                that.batchUpdateFromOffset(batchItem, viName);
                            }
                            else if (updateType === NationalInstruments.Web.Interop.UpdateData.BatchUpdateFromJson) {
                                that.batchUpdateFromJson(batchItem, viName);
                            }
                        }
                        if (batch.waitForFrameUpdate === true) {
                            yield NationalInstruments.HtmlVI.RenderEngine.waitForFrameUpdate();
                        }
                    }
                    catch (error) {
                        NI_SUPPORT.error(error.toString() + "\n" + error.stack);
                    }
                    window.engine.trigger(browserMessageEnum.SET_CALL_RESPONSE, cookie, 1);
                });
            };
            that.windowEngineCallbacks.setGPropertyValue = function (argsArr) {
                const cookie = argsArr[0], viName = argsArr[1], controlId = argsArr[2], gPropertyName = argsArr[3], gPropertyValue = argsArr[4];
                const viModels = that.getVIModels();
                const viModel = viModels[viName];
                if (viModel !== undefined) {
                    viModel.processControlUpdateToSetGPropertyValue(controlId, gPropertyName, gPropertyValue);
                }
                else {
                    throw new Error('No VI found with name: ' + viName + ' to send control property update');
                }
                if (cookie !== 0) {
                    window.engine.trigger(BROWSER_MESSAGE_ENUM.SET_CALL_RESPONSE, cookie, 1);
                }
            };
            that.windowEngineCallbacks.invokeControlFunction = function (argsArr) {
                return __awaiter(this, void 0, void 0, function* () {
                    const [requestId, viName, controlId, functionName, args] = argsArr;
                    let result;
                    try {
                        const viModel = that.getVIModels()[viName];
                        if (viModel === undefined) {
                            throw new Error(`No VI found with name ${viName} to invoke function ${functionName}.`);
                        }
                        const controlViewModel = viModel.getControlViewModel(controlId);
                        if (controlViewModel === undefined) {
                            throw new Error(`No control found with id ${controlId} in ${functionName}`);
                        }
                        const output = yield viModel.invokeControlFunction(controlId, functionName, args);
                        if (output !== undefined) {
                            result = NationalInstruments.PackedData.NIPackedDataAdaptors.PackDataIntoSharedMemory(output, window.NITypes.STRING);
                        }
                    }
                    finally {
                        window.engine.trigger(BROWSER_MESSAGE_ENUM.SET_CALL_RESPONSE, requestId, result);
                    }
                });
            };
            that.windowEngineCallbacks.getPackedGPropertyValue = function (argsArr) {
                return __awaiter(this, void 0, void 0, function* () {
                    const cookie = argsArr[0], viName = argsArr[1], controlId = argsArr[2], gPropertyName = argsArr[3];
                    yield NationalInstruments.HtmlVI.RenderEngine.waitForFrameUpdate();
                    const viModels = that.getVIModels();
                    const viModel = viModels[viName];
                    let result = '';
                    if (viModel !== undefined) {
                        const propertyValue = viModel.processControlUpdateToGetGPropertyValue(controlId, gPropertyName);
                        const controlModel = viModel.controlModels[controlId];
                        const propertyType = controlModel.gPropertyNIType(gPropertyName);
                        result = NationalInstruments.PackedData.NIPackedDataAdaptors.PackDataIntoSharedMemory(propertyValue, propertyType);
                    }
                    else {
                        throw new Error('No VI found with name: ' + viName + ' to get control property value');
                    }
                    window.engine.trigger(BROWSER_MESSAGE_ENUM.SET_CALL_RESPONSE, cookie, result);
                });
            };
            that.windowEngineCallbacks.getJsonGPropertyValue = function (argsArr) {
                return __awaiter(this, void 0, void 0, function* () {
                    const cookie = argsArr[0], viName = argsArr[1], controlId = argsArr[2], gPropertyName = argsArr[3];
                    yield NationalInstruments.HtmlVI.RenderEngine.waitForFrameUpdate();
                    const viModels = that.getVIModels();
                    const viModel = viModels[viName];
                    let result = {};
                    if (viModel !== undefined) {
                        const gPropertyValue = viModel.processControlUpdateToGetGPropertyValue(controlId, gPropertyName);
                        result = JSON.stringify(gPropertyValue);
                    }
                    else {
                        throw new Error('No VI found with name: ' + viName + ' to get control property value');
                    }
                    window.engine.trigger(BROWSER_MESSAGE_ENUM.SET_CALL_RESPONSE, cookie, result);
                });
            };
            that.windowEngineCallbacks.getGPropertyValue = function (argsArr) {
                return __awaiter(this, void 0, void 0, function* () {
                    const cookie = argsArr[0], viName = argsArr[1], controlId = argsArr[2], gPropertyName = argsArr[3];
                    yield NationalInstruments.HtmlVI.RenderEngine.waitForFrameUpdate();
                    const viModels = that.getVIModels();
                    const viModel = viModels[viName];
                    let result = {};
                    if (viModel !== undefined) {
                        result = viModel.processControlUpdateToGetGPropertyValue(controlId, gPropertyName);
                    }
                    else {
                        throw new Error('No VI found with name: ' + viName + ' to get control property value');
                    }
                    window.engine.trigger(BROWSER_MESSAGE_ENUM.SET_CALL_RESPONSE, cookie, result);
                });
            };
            window.engine.on(browserMessageEnum.DIAGRAM_VALUE_CHANGED, that.windowEngineCallbacks.diagramValueChanged);
            window.engine.on(browserMessageEnum.BATCH_UPDATE, that.windowEngineCallbacks.batchUpdate);
            window.engine.on(browserMessageEnum.SET_GPROPERTY_PROPERTY_VALUE, that.windowEngineCallbacks.setGPropertyValue);
            window.engine.on(browserMessageEnum.GET_GPROPERTY_PROPERTY_VALUE, that.windowEngineCallbacks.getGPropertyValue);
            window.engine.on(browserMessageEnum.GET_PACKED_GPROPERTY_PROPERTY_VALUE, that.windowEngineCallbacks.getPackedGPropertyValue);
            window.engine.on(browserMessageEnum.GET_JSON_GPROPERTY_PROPERTY_VALUE, that.windowEngineCallbacks.getJsonGPropertyValue);
            window.engine.on(browserMessageEnum.INVOKE_CONTROL_FUNCTION, that.windowEngineCallbacks.invokeControlFunction);
            this.registerPageNavigationListener();
            window.engine.call(BROWSER_MESSAGE_ENUM.DOCUMENT_READY);
            // Send requests for VI updates
            let i;
            const visToSync = Object.keys(that.getVIModels());
            for (i = 0; i < visToSync.length; i = i + 1) {
                window.engine.trigger(BROWSER_MESSAGE_ENUM.READY_FOR_UPDATES, visToSync[i]);
            }
            window.engine.call(BROWSER_MESSAGE_ENUM.UPDATE_SERVICE_STARTED);
            that.setServiceState(SERVICE_STATE_ENUM.LISTENING);
        }
        stop() {
            parent.prototype.stop.call(this, SERVICE_STATE_ENUM.LISTENING);
            window.engine.off(browserMessageEnum.DIAGRAM_VALUE_CHANGED, this.windowEngineCallbacks.diagramValueChanged);
            window.engine.off(browserMessageEnum.BATCH_UPDATE, this.windowEngineCallbacks.batchUpdate);
            window.engine.off(browserMessageEnum.SET_GPROPERTY_PROPERTY_VALUE, this.windowEngineCallbacks.setGPropertyValue);
            window.engine.off(browserMessageEnum.GET_GPROPERTY_PROPERTY_VALUE, this.windowEngineCallbacks.getGPropertyValue);
            window.engine.off(browserMessageEnum.GET_PACKED_GPROPERTY_PROPERTY_VALUE, this.windowEngineCallbacks.getPackedGPropertyValue);
            window.engine.off(browserMessageEnum.GET_JSON_GPROPERTY_PROPERTY_VALUE, this.windowEngineCallbacks.getJsonGPropertyValue);
            window.engine.off(browserMessageEnum.INVOKE_CONTROL_FUNCTION, this.windowEngineCallbacks.invokeControlFunction);
            this.unregisterPageNavigationListener();
            this.setServiceState(SERVICE_STATE_ENUM.READY);
        }
        batchUpdateFromBuffer(batchItem, viName) {
            const propertyName = batchItem.propertyName();
            const controlId = batchItem.runtimeId();
            const batchData = batchItem.data(new NationalInstruments.Web.Interop.BatchUpdateFromBuffer());
            const memoryId = batchData.memoryId();
            const startPosition = batchData.position();
            const bufferLength = batchData.length();
            const response = browserMessaging.getSharedData(memoryId);
            const view = new Uint8Array(response, startPosition, bufferLength - startPosition);
            const viModel = this.getVIModels()[viName];
            const controlModel = viModel.controlModels[controlId];
            const propertyType = controlModel.gPropertyNIType(propertyName);
            const gPropertyValue = NationalInstruments.PackedData.NIPackedDataAdaptors.GetDataAdaptorFromPackedValue(view, propertyType).unpack();
            viModel.processControlUpdateToSetGPropertyValue(controlId, propertyName, gPropertyValue);
        }
        batchUpdateFromOffset(batchItem, viName) {
            const propertyName = batchItem.propertyName();
            const controlId = batchItem.runtimeId();
            const batchData = batchItem.data(new NationalInstruments.Web.Interop.BatchUpdateFromOffset());
            const bufferValue = batchData.data(new NationalInstruments.Web.Interop.UnknownTable());
            const viModel = this.getVIModels()[viName];
            const controlModel = viModel.controlModels[controlId];
            const propertyType = controlModel.gPropertyNIType(propertyName);
            if (propertyType === undefined) {
                throw new Error('Property type not found for property: ' + propertyName + ' controlId: ' + controlId.toString());
            }
            const gPropertyValue = NationalInstruments.PackedData.NIPackedDataAdaptors.GetDataAdaptorFromIndex(bufferValue, propertyType).unpack();
            viModel.processControlUpdateToSetGPropertyValue(controlId, propertyName, gPropertyValue);
        }
        batchUpdateFromJson(batchItem, viName) {
            const propertyName = batchItem.propertyName();
            const controlId = batchItem.runtimeId();
            const batchData = batchItem.data(new NationalInstruments.Web.Interop.BatchUpdateFromJson());
            const json = batchData.propertyJson();
            const value = JSON.parse(json);
            const viModel = this.getVIModels()[viName];
            viModel.processControlUpdateToSetGPropertyValue(controlId, propertyName, value);
        }
        // Called by the WebAppModel
        controlChanged(viModel, controlModel, propertyName, newValue, _oldValue) {
            controlModel = controlModel.findTopLevelControl();
            if (controlModel.bindingInfo.prop === propertyName && controlModel.bindingInfo.dataItem !== '') {
                newValue = controlModel[propertyName];
            }
            const propertyType = controlModel.gPropertyNIType(propertyName);
            if (propertyType !== undefined) {
                const modelIdentifier = controlModel.niControlId;
                const sharedDataId = NationalInstruments.PackedData.NIPackedDataAdaptors.PackDataIntoSharedMemory(newValue, propertyType);
                window.engine.trigger(BROWSER_MESSAGE_ENUM.PANEL_CONTROL_CHANGED, viModel.viName, modelIdentifier, propertyName, sharedDataId);
            }
        }
        // Called by the WebAppModel
        internalControlEventOccurred(viModel, controlModel, eventName, eventData) {
            const data = {};
            data[eventName] = eventData;
            window.engine.trigger(BROWSER_MESSAGE_ENUM.PROCESS_INTERNAL_EVENT, viModel.viName, controlModel.niControlId, JSON.stringify(data));
        }
        // Called by the WebAppModel
        controlEventOccurred(viModel, controlModel, eventName, eventData) {
            controlModel = controlModel.findTopLevelControl();
            const modelIdentifier = controlModel.niControlId;
            window.engine.trigger(BROWSER_MESSAGE_ENUM.PANEL_CONTROL_EVENT_OCCURRED, viModel.viName, modelIdentifier, eventName, JSON.stringify(eventData));
        }
        static get StateEnum() {
            return stateEnum;
        }
        static get BrowserMessagesEnum() {
            return browserMessageEnum;
        }
    }
    NationalInstruments.HtmlVI.EditorRuntimeUpdateService = EditorRuntimeUpdateService;
    const SERVICE_STATE_ENUM = NationalInstruments.HtmlVI.EditorRuntimeUpdateService.StateEnum;
    const INIT_TASKS_ENUM = NationalInstruments.HtmlVI.EditorRuntimeUpdateService.InitTasksEnum;
    const BROWSER_MESSAGE_ENUM = NationalInstruments.HtmlVI.EditorRuntimeUpdateService.BrowserMessagesEnum;
})();
//# sourceMappingURL=niEditorRuntimeUpdateService.js.map