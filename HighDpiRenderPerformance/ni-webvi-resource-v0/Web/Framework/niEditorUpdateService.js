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
// Service that handles interaction with the LabVIEW Editor
// National Instruments Copyright 2014
//**********************************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const EDITOR_ADAPTERS = NationalInstruments.HtmlVI.NIEditorDataAdapters;
    const USER_INTERACTION_STATE_ENUM = NationalInstruments.HtmlVI.EditorInteractionStates.UserInteractionState;
    const stateEnum = Object.freeze(Object.assign({}, NationalInstruments.HtmlVI.WebApplicationStates.ServiceStateEnum, {
        INITIALIZING: 'INITIALIZING',
        LISTENING: 'LISTENING'
    }));
    const browserMessagesEnum = Object.freeze({
        PROPERTY_CHANGE: 'PropertyChange',
        PROPERTY_CHANGE_MULTIPLE: 'PropertyChangeMultiple',
        ADD_ELEMENT: 'AddElement',
        ADD_OR_UPDATE_HTML_ELEMENT: 'AddOrUpdateHtmlElement',
        REMOVE_ELEMENT: 'RemoveElement',
        PROCESS_MODEL_UPDATE: 'ProcessModelUpdate',
        PROCESS_INTERNAL_EVENT: 'ProcessInternalEvent',
        BOUNDS_UPDATE: 'BoundsUpdate',
        DOCUMENT_READY: 'DocumentReady',
        UPDATE_SERVICE_STARTED: 'UpdateServiceStarted',
        USERINTERACTION_CHANGED: 'UserInteractionChanged',
        SET_PANEL_POSITION: 'SetPanelPosition',
        INVOKE_CONTROL_FUNCTION: 'InvokeControlFunction',
        SET_CALL_RESPONSE: 'setCallResponse'
    });
    class EditorUpdateService extends NationalInstruments.HtmlVI.UpdateService {
        constructor() {
            super();
            // References to callbacks registered to browser so they can be unregistered later
            this.windowEngineCallbacks = {
                propertyChange: undefined,
                propertyChangeMultiple: undefined,
                addElement: undefined,
                addOrUpdateHtmlElement: undefined,
                removeElement: undefined,
                userInteractionChanged: undefined,
                setPanelPosition: undefined,
                invokeControlFunction: undefined
            };
            this.keyEventHandler = {
                undoRedo: undefined
            };
        }
        static get StateEnum() {
            return stateEnum;
        }
        static get BrowserMessagesEnum() {
            return browserMessagesEnum;
        }
        isValidServiceState(state) {
            // Child states merged with parent states so only need to check child
            const isValidState = EditorUpdateService.StateEnum[state] !== undefined;
            return isValidState;
        }
        isInIdeMode() {
            return true;
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
            NI_SUPPORT.logVerbose('niEditorUpdateService start()');
            that.windowEngineCallbacks.propertyChange = function (argsArr) {
                const viName = argsArr[0];
                const controlId = argsArr[1];
                const dataJSON = argsArr[2];
                const data = JSON.parse(dataJSON);
                that.dispatchMessageToHTMLPanel(viName, controlId, data, EDITOR_ADAPTERS.editorToJsModel);
            };
            that.windowEngineCallbacks.propertyChangeMultiple = function (argsArr) {
                return __awaiter(this, void 0, void 0, function* () {
                    const cookie = argsArr[0];
                    const viName = argsArr[1];
                    const controlIdsJSON = argsArr[2];
                    const dataValuesJSON = argsArr[3];
                    const controlIds = JSON.parse(controlIdsJSON);
                    const dataValues = JSON.parse(dataValuesJSON);
                    let i;
                    for (i = 0; i < controlIds.length; i++) {
                        that.dispatchMessageToHTMLPanel(viName, controlIds[i], dataValues[i], EDITOR_ADAPTERS.editorToJsModel);
                    }
                    yield NationalInstruments.HtmlVI.RenderEngine.waitForFrameUpdate();
                    window.engine.trigger(BROWSER_MESSAGE_ENUM.SET_CALL_RESPONSE, cookie, 0);
                });
            };
            // NOTE: If changes are made to this function, make sure to run the Reparenting Regression Test prior to submission: https://nitalk.jiveon.com/docs/DOC-358124
            that.windowEngineCallbacks.addElement = function (argsArr) {
                const modelSettingsJSON = argsArr[0];
                const modelSettings = JSON.parse(modelSettingsJSON);
                let modelMetadata = {};
                // TODO mraj the C# code should be modified to emit the correct viRef
                modelSettings.viRef = '';
                // TODO mraj refactoring so modelSettings is strictly properties used by the JavaScript models and modelMetadata is everything else
                // ideally the C# side would be modified to reflect these assumptions
                modelMetadata = {
                    parentId: argsArr[1],
                    nextModelId: argsArr[2],
                    initialLoad: argsArr[3],
                    modelAttached: true,
                    extras: undefined,
                    kind: undefined
                };
                modelMetadata.extras = modelSettings.extras;
                modelMetadata.kind = modelSettings.kind;
                delete modelSettings.extras;
                delete modelSettings.kind;
                NI_SUPPORT.infoVerbose('add Element (editor) ' + modelMetadata.kind + '(' + modelSettings.niControlId + ') ' + modelSettings + ' ' + modelMetadata);
                // TODO mraj modelKindToTagName only works when a model has a 1 to 1 mapping to an element. In the future seetings needs to explicitly include a tagName
                const tagName = NationalInstruments.HtmlVI.NIModelProvider.modelKindToTagName(modelMetadata.kind);
                const resultElements = NationalInstruments.HtmlVI.UpdateService.createNIControlToAddToDOM(modelSettings, tagName, modelSettings.niControlId, modelSettings.viRef, modelMetadata.parentId);
                const viViewModel = NationalInstruments.HtmlVI.viReferenceService.getVIViewModelByVIRef(modelSettings.viRef);
                const draggingClass = 'ni-is-being-dragged';
                const parentElementIsFlexibleComponent = resultElements.parentElement.tagName.toLowerCase() === 'ni-flexible-layout-component';
                if (viViewModel.isUserInteracting(modelSettings.niControlId)) {
                    resultElements.controlElement.classList.add(draggingClass);
                }
                else if (parentElementIsFlexibleComponent) {
                    // If the user hit "escape" to cancel the user interaction, we need to remove the dragging class from the parent flexible component.
                    resultElements.parentElement.classList.remove(draggingClass);
                }
                resultElements.controlElement._modelMetadata = modelMetadata;
                let key;
                for (key in modelMetadata.extras) {
                    if (modelMetadata.extras.hasOwnProperty(key)) {
                        resultElements.controlElement.setAttribute(key, modelMetadata.extras[key]);
                    }
                }
                let insertBeforeNode;
                if (modelMetadata.nextModelId !== '') {
                    insertBeforeNode = NI_SUPPORT.queryControlByNIControlId(modelSettings.viRef, modelMetadata.nextModelId);
                    if (insertBeforeNode === null) {
                        NI_SUPPORT.errorVerbose('Attempting to insert new element id (' + modelSettings.niControlId + ') next to existing element id (' + modelMetadata.nextModelId + ') but the existing element cannot be found. Ignoring nextModelId and adding as child of parent.');
                        insertBeforeNode = undefined;
                    }
                }
                if (resultElements.parentElement === undefined) {
                    throw new Error('A child element was added to the DOM before its parent. ParentId: ' + modelMetadata.parentId + '. child to add: ' + modelSettings);
                }
                else {
                    if (insertBeforeNode !== undefined) {
                        resultElements.parentElement.insertBefore(resultElements.controlElement, insertBeforeNode);
                    }
                    else {
                        resultElements.parentElement.appendChild(resultElements.controlElement);
                    }
                }
                that.boundsUpdateEventService.onElementAdded(resultElements.controlElement, modelSettings.niControlId);
            };
            that.windowEngineCallbacks.addOrUpdateHtmlElement = function (argsArr) {
                const viName = argsArr[0], modelSettings = JSON.parse(argsArr[1]), generatedItemParentId = argsArr[2], initialLoad = argsArr[3];
                const existingControl = NI_SUPPORT.queryControlByNIControlId('', modelSettings.niControlId);
                if (existingControl === null) {
                    const elementArgsArr = [argsArr[1], generatedItemParentId, '', initialLoad];
                    that.windowEngineCallbacks.addElement(elementArgsArr);
                }
                else {
                    delete modelSettings['kind'];
                    that.dispatchMessageToHTMLPanel(viName, modelSettings.niControlId, modelSettings, EDITOR_ADAPTERS.editorToJsModel);
                }
            };
            // NOTE: If changes are made to this function, make sure to run the Reparenting Regression Test prior to submission: https://nitalk.jiveon.com/docs/DOC-358124
            that.windowEngineCallbacks.removeElement = function (argsArr) {
                const controlId = argsArr[0];
                const modelAttached = argsArr[1];
                const viRef = '';
                NI_SUPPORT.infoVerbose('remove Element (editor)' + controlId + ' ' + argsArr);
                const precheckElement = NI_SUPPORT.queryControlByNIControlId(viRef, controlId);
                if (precheckElement === null) {
                    NI_SUPPORT.errorVerbose('Attempted to remove an element with niControlId(' + controlId + ') but it could not be found. It is known that numerics are incorrectly removed multiple times, but if it was a different control this needs to be debugged further.');
                    return;
                }
                const resultElements = NationalInstruments.HtmlVI.UpdateService.findNIControlToRemoveFromDOM(controlId, viRef);
                resultElements.controlElement._modelMetadata.modelAttached = modelAttached;
                const parentNode = resultElements.controlElement.parentNode;
                parentNode.removeChild(resultElements.controlElement);
                that.boundsUpdateEventService.onElementRemoved(controlId);
            };
            that.windowEngineCallbacks.userInteractionChanged = function (argsArr) {
                const viName = argsArr[0];
                const controlId = argsArr[1];
                const operationKind = argsArr[2];
                const state = argsArr[3];
                const viModel = that.getVIModels()[viName];
                const controlViewModel = viModel.getControlViewModel(controlId);
                const viViewModel = NationalInstruments.HtmlVI.viReferenceService.getVIViewModelByVIRef(viModel.viRef);
                if (state === USER_INTERACTION_STATE_ENUM.START) {
                    viViewModel.setUserInteracting(controlId);
                }
                else if (state === USER_INTERACTION_STATE_ENUM.END) {
                    viViewModel.clearUserInteracting(controlId);
                }
                if (state !== USER_INTERACTION_STATE_ENUM.ATOMICACTIONCOMPLETE) {
                    that.boundsUpdateEventService.requestSendElementBounds();
                }
                const frontPanelViewModel = viModel.getFrontPanelControlViewModel();
                frontPanelViewModel.userInteractionChanged(state, operationKind);
                if (controlViewModel instanceof NationalInstruments.HtmlVI.ViewModels.VisualComponentViewModel) {
                    controlViewModel.userInteractionChanged(state, operationKind);
                }
            };
            that.windowEngineCallbacks.setPanelPosition = function (argsArr) {
                const position = JSON.parse(argsArr[0]);
                const left = position[0];
                const top = position[1];
                const notifyOnComplete = argsArr[1];
                const frontPanel = NationalInstruments.HtmlVI.UpdateService.getFrontPanelElement();
                const leftInPixels = `${left}px`;
                const topInPixels = `${top}px`;
                if (frontPanel === document.body) {
                    return; // Do nothing if we have no front panel section
                }
                // TODO : US195693
                const frontPanelModel = viModel.getFrontPanelControlModel();
                if (frontPanelModel !== undefined) {
                    frontPanelModel.top = topInPixels;
                    frontPanelModel.left = leftInPixels;
                }
                window.requestAnimationFrame(function () {
                    frontPanel.style.left = leftInPixels;
                    frontPanel.style.top = topInPixels;
                    if (notifyOnComplete) {
                        window.requestAnimationFrame(function () {
                            window.engine.trigger('SetPanelPositionComplete');
                        });
                    }
                });
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
                        const output = yield controlViewModel.invokeInternalControlFunction(functionName, args);
                        if (output !== undefined) {
                            result = JSON.stringify(output);
                        }
                    }
                    finally {
                        window.engine.trigger('InvokeControlFunctionComplete', requestId, result);
                    }
                });
            };
            // All the key events reach both C# and js.
            // For things like backspace/delete/Ctrl+A/Ctrl+V/Ctrl+X/Ctrl+C, the Html controls need these events.
            // So we block these events in C# side let the browser consume these events when an editable control is focused.
            // But for Ctrl+z/Ctrl+y/Ctrl+Shift+Z events, we never want html to handle them.
            // The C# side transaction manager will handle the undo/redo when we are not editing controls.
            // So we capture and discard the defaut undo/redo event in browser side.
            that.keyEventHandler.undoRedo = function (event) {
                // The keycode property has been deprecated and we should use key property instead.
                // but the Browser doesn't support key property.
                // default undo key combination
                if ((event.ctrlKey && (event.keyCode === 90 || event.key === 'z')) ||
                    // default redo key combination
                    (event.ctrlKey && (event.keyCode === 89 || event.key === 'y')) ||
                    // default redo key combination
                    (event.ctrlKey && event.shiftKey && (event.keyCode === 90 || event.key === 'z'))) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            window.engine.on(BROWSER_MESSAGE_ENUM.PROPERTY_CHANGE, that.windowEngineCallbacks.propertyChange);
            window.engine.on(BROWSER_MESSAGE_ENUM.PROPERTY_CHANGE_MULTIPLE, that.windowEngineCallbacks.propertyChangeMultiple);
            window.engine.on(BROWSER_MESSAGE_ENUM.ADD_ELEMENT, that.windowEngineCallbacks.addElement);
            window.engine.on(BROWSER_MESSAGE_ENUM.ADD_OR_UPDATE_HTML_ELEMENT, that.windowEngineCallbacks.addOrUpdateHtmlElement);
            window.engine.on(BROWSER_MESSAGE_ENUM.REMOVE_ELEMENT, that.windowEngineCallbacks.removeElement);
            window.engine.on(BROWSER_MESSAGE_ENUM.USERINTERACTION_CHANGED, that.windowEngineCallbacks.userInteractionChanged);
            window.engine.on(BROWSER_MESSAGE_ENUM.SET_PANEL_POSITION, that.windowEngineCallbacks.setPanelPosition);
            window.engine.on(BROWSER_MESSAGE_ENUM.INVOKE_CONTROL_FUNCTION, that.windowEngineCallbacks.invokeControlFunction);
            const viViewModel = NationalInstruments.HtmlVI.viReferenceService.getVIViewModelByVIRef('');
            const viModel = viViewModel.model;
            const frontPanelViewModel = viModel.getFrontPanelControlViewModel();
            that.boundsUpdateEventService = new NationalInstruments.HtmlVI.Framework.NIBoundsUpdateEventService(frontPanelViewModel, (eventDataJson) => window.engine.trigger(BROWSER_MESSAGE_ENUM.BOUNDS_UPDATE, eventDataJson));
            that.registerPageNavigationListener();
            document.addEventListener('keydown', that.keyEventHandler.undoRedo, true);
            NI_SUPPORT.logVerbose('niEditorUpdateService start() document ready');
            window.engine.call(BROWSER_MESSAGE_ENUM.DOCUMENT_READY);
            NI_SUPPORT.logVerbose('niEditorUpdateService start() update service starting');
            window.engine.call(BROWSER_MESSAGE_ENUM.UPDATE_SERVICE_STARTED);
            that.setServiceState(SERVICE_STATE_ENUM.LISTENING);
        }
        stop() {
            super.stop(SERVICE_STATE_ENUM.LISTENING);
            window.engine.off(BROWSER_MESSAGE_ENUM.PROPERTY_CHANGE, this.windowEngineCallbacks.propertyChange);
            window.engine.off(BROWSER_MESSAGE_ENUM.PROPERTY_CHANGE_MULTIPLE, this.windowEngineCallbacks.propertyChangeMultiple);
            window.engine.off(BROWSER_MESSAGE_ENUM.ADD_ELEMENT, this.windowEngineCallbacks.addElement);
            window.engine.off(BROWSER_MESSAGE_ENUM.ADD_OR_UPDATE_HTML_ELEMENT, this.windowEngineCallbacks.addOrUpdateHtmlElement);
            window.engine.off(BROWSER_MESSAGE_ENUM.REMOVE_ELEMENT, this.windowEngineCallbacks.removeElement);
            window.engine.off(BROWSER_MESSAGE_ENUM.USERINTERACTION_CHANGED, this.windowEngineCallbacks.userInteractionChanged);
            window.engine.off(BROWSER_MESSAGE_ENUM.SET_PANEL_POSITION, this.windowEngineCallbacks.setPanelPosition);
            window.engine.off(BROWSER_MESSAGE_ENUM.INVOKE_CONTROL_FUNCTION, this.windowEngineCallbacks.invokeControlFunction);
            document.removeEventListener('keydown', this.keyEventHandler.undoRedo, true);
            this.windowEngineCallbacks.propertyChange = undefined;
            this.windowEngineCallbacks.propertyChangeMultiple = undefined;
            this.windowEngineCallbacks.addElement = undefined;
            this.windowEngineCallbacks.addOrUpdateHtmlElement = undefined;
            this.windowEngineCallbacks.removeElement = undefined;
            this.windowEngineCallbacks.userInteractionChanged = undefined;
            this.windowEngineCallbacks.setPanelPosition = undefined;
            this.keyEventHandler.undoRedo = undefined;
            this.boundsUpdateEventService = undefined;
            this.unregisterPageNavigationListener();
            this.setServiceState(SERVICE_STATE_ENUM.READY);
        }
        // Called by the WebAppModel
        internalControlEventOccurred(viModel, controlModel, eventName, eventData) {
            const data = {};
            data[eventName] = eventData;
            // TODO mraj should check update service state before triggering event
            window.engine.trigger(BROWSER_MESSAGE_ENUM.PROCESS_INTERNAL_EVENT, viModel.viName, controlModel.niControlId, JSON.stringify(data));
        }
        // Called by the WebAppModel
        controlChanged(viModel, controlModel, propertyName, _newValue, _oldValue) {
            let topLevelControl, topLevelControlValue, topLevelControlValueJSON;
            if (controlModel.bindingInfo.prop === propertyName) {
                topLevelControl = controlModel.findTopLevelControl();
                topLevelControlValue = topLevelControl[topLevelControl.bindingInfo.prop];
                if (topLevelControl.modelPropertyUsesNIType(topLevelControl.bindingInfo.prop)) {
                    topLevelControlValue = EDITOR_ADAPTERS.jsModelToEditor(topLevelControlValue, topLevelControl.niType);
                }
                topLevelControlValueJSON = JSON.stringify(topLevelControlValue);
                // TODO mraj should check update service state before triggering event
                window.engine.trigger(BROWSER_MESSAGE_ENUM.PROCESS_MODEL_UPDATE, viModel.viName, topLevelControl.niControlId, topLevelControlValueJSON);
            }
        }
        requestSendControlBounds() {
            if (this.boundsUpdateEventService !== undefined) {
                this.boundsUpdateEventService.requestSendElementBounds();
            }
        }
    }
    NationalInstruments.HtmlVI.EditorUpdateService = EditorUpdateService;
    const SERVICE_STATE_ENUM = NationalInstruments.HtmlVI.EditorUpdateService.StateEnum;
    const BROWSER_MESSAGE_ENUM = NationalInstruments.HtmlVI.EditorUpdateService.BrowserMessagesEnum;
})();
//# sourceMappingURL=niEditorUpdateService.js.map