"use strict";
//**********************************************************
// Service that handles interaction with Vireo
// National Instruments Copyright 2014
//**********************************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const DATETIME_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.JQXDateTimeValueConverter;
    class UpdateService {
        constructor() {
            // Public Instance Properties
            this.setServiceState = undefined;
            this.verifyServiceStateIs = undefined;
            this.checkServiceStateIs = undefined;
            this.getVIModels = undefined;
            this.enableEvents = false;
            // References to callbacks registered to browser so they can be unregistered later
            this.windowEngineCallbacks = {
                getPropertyValue: undefined,
                controlExists: undefined,
                indexOfControl: undefined
            };
        }
        static get InitTasksEnum() {
            return {
                ELEMENTSREADY: 'ELEMENTSREADY'
            };
        }
        static get BrowserMessagesEnum() {
            return {
                GET_PROPERTY_VALUE: 'GetPropertyValue',
                CONTROL_EXISTS: 'ControlExists',
                INDEX_OF_CONTROL: 'IndexOfControl',
                NAVIGATION_ATTEMPTED: 'NavigationAttempted',
                UNREGISTER_PAGE_NAVIGATION_LISTENER: 'UnregisterPageNavigationListener'
            };
        }
        // Static Public Functions
        // Gets the FrontPanelCanvas element on the page, if one is present. Otherwise returns document.body.
        static getFrontPanelElement() {
            let element = document.querySelector('ni-front-panel');
            if (element === null) {
                element = document.body;
            }
            return element;
        }
        // Uses the current DOM to create an ni-element that can be added to the DOM (but is not added yet). The created element and the parent element are returned for use.
        // modelSettings: an object that will be attached to the instance of the DOM element as the property name _temporaryModelSettingsHolder
        // controlTagName: the tagName of the element to be created, ie 'ni-boolean-control'
        // niControlId: the id to assign to the control as a string
        // viRef: the viRef associated with the ni-virtual-instrument that owns the control to be created
        // parentControlId: The id of the parent control
        //     if the parentControlId is empty string then the returned parent element is the Front Panel element if present, or document.body otherwise
        //     if the parentControlId is a string that corresponds to an niControlId in the dom then the returned parent element is the corresponding element
        //     if the parentControlId is a string that is not empty and does not correspond to an niControlId in the dom then the returned parent element is the value undefined
        // NOTE: This function should only perform DOM manipulation and should not require model / viewmodel state information
        // NOTE: This function should not be used directly (via eval, etc), instead update services should invoke as needed
        // NOTE: This function relies on rigorous assumptions about the state of the DOM. If the DOM is in an invalid state, handle those cases and make sure the DOM is valid before calling this function
        static createNIControlToAddToDOM(modelSettings, controlTagName, niControlId, viRef, parentControlId) {
            if (typeof modelSettings !== 'object' || modelSettings === null) {
                throw new Error('Model settings that are provided should be a JS object with properties');
            }
            if (typeof controlTagName !== 'string' || controlTagName === '') {
                throw new Error('An element needs a valid controlTagName string to be created');
            }
            if (typeof niControlId !== 'string' || niControlId === '') {
                throw new Error('An element needs a valid niControlId string to be created');
            }
            if (typeof viRef !== 'string') {
                throw new Error('An element needs a valid target viRef string to be created');
            }
            if (typeof parentControlId !== 'string') {
                throw new Error('An element needs to have a valid parentControlId string to be created');
            }
            const viElements = NI_SUPPORT.queryVirtualInstrumentsByVIRef(viRef);
            if (viElements.length !== 1) {
                throw new Error('The DOM should only contain one ni-virtual-instrument with vi-ref: ' + viRef);
            }
            const controlElements = NI_SUPPORT.queryAllControlsByNIControlId(viRef, niControlId);
            if (controlElements.length !== 0) {
                throw new Error('The DOM already contains an element with vi-ref (' + viRef + ') and ni-control-id (' + niControlId + '), but currently has (' + controlElements.length + ') elements');
            }
            const controlElement = document.createElement(controlTagName);
            if (!NI_SUPPORT.isElement(controlElement)) {
                throw new Error('Only Html Custom Elements can be created with createNIControlToAddToDOM');
            }
            controlElement.niControlId = niControlId;
            controlElement.viRef = viRef;
            controlElement._temporaryModelSettingsHolder = modelSettings;
            let parentElements, parentElement;
            if (parentControlId === '') {
                parentElement = UpdateService.getFrontPanelElement();
            }
            else {
                parentElements = NI_SUPPORT.queryAllControlsByNIControlId(viRef, parentControlId);
                if (parentElements.length > 1) {
                    throw new Error('The DOM has too many elements with vi-ref (' + viRef + ') and ni-control-id (' + parentControlId + ')');
                }
                else if (parentElements.length === 1) {
                    parentElement = parentElements[0];
                }
                else {
                    parentElement = undefined;
                }
            }
            return {
                controlElement: controlElement,
                parentElement: parentElement
            };
        }
        // Finds an element that can be removed from the dom and returns a reference to the element and it's associated parent
        // NOTE: This function should only perform DOM manipulation and should not require model / viewmodel state information
        // NOTE: This function should not be used directly (via eval, etc), instead update services should invoke as needed
        // NOTE: This function relies on rigorous assumptions about the state of the DOM. If the DOM is in an invalid state, handle those cases and make sure the DOM is valid before calling this function
        static findNIControlToRemoveFromDOM(niControlId, viRef) {
            if (typeof niControlId !== 'string' || niControlId === '') {
                throw new Error('An element needs a valid niControlId string to be created');
            }
            if (typeof viRef !== 'string') {
                throw new Error('An element needs a valid target viRef string to be created');
            }
            const controlElements = NI_SUPPORT.queryAllControlsByNIControlId(viRef, niControlId);
            if (controlElements.length !== 1) {
                throw new Error('The DOM should contain exactly one element with vi-ref (' + viRef + ') and ni-control-id (' + niControlId + '), but currently has (' + controlElements.length + ') elements');
            }
            const controlElement = controlElements[0];
            if (!NI_SUPPORT.isElement(controlElement)) {
                throw new Error('Only Html Custom elements can be removed with findNIControlToRemoveFromDOM');
            }
            let currParent;
            let parentElement = UpdateService.getFrontPanelElement();
            for (currParent = controlElement.parentElement; currParent !== null; currParent = currParent.parentElement) {
                if (NI_SUPPORT.isElement(controlElement)) {
                    parentElement = currParent;
                    break;
                }
            }
            return {
                controlElement: controlElement,
                parentElement: parentElement
            };
        }
        applyWebAppServiceStateProvider(webAppServiceStateProvider) {
            this.setServiceState = webAppServiceStateProvider.setServiceState;
            this.verifyServiceStateIs = webAppServiceStateProvider.verifyServiceStateIs;
            this.checkServiceStateIs = webAppServiceStateProvider.checkServiceStateIs;
        }
        applyVirtualInstrumentModelsProvider(virtualInstrumentModelsProvider) {
            this.getVIModels = virtualInstrumentModelsProvider.getVIModels;
        }
        // typedValueAdapter, if specified, will be used to transform property values before setting on the control model.
        // For example, what we get from the editor (or Vireo) may not exactly match what the control model wants for a property.
        // It will be called for any property that uses the model's niType property (e.g. model.modelPropertyUsesNIType()
        // returns true for that property).
        dispatchMessageToHTMLPanel(viName, controlId, properties, typedValueAdapter) {
            const viModels = this.getVIModels();
            const viModel = viModels[viName];
            if (viModel !== undefined) {
                viModel.processControlUpdate(controlId, properties, typedValueAdapter);
            }
            else {
                throw new Error('No VI found with name: ' + viName + ' to send control property update');
            }
        }
        isInIdeMode() {
            return false;
        }
        // Called by the WebAppModel
        internalControlEventOccurred(_viModel, _controlModel, _eventName, _eventData) {
        }
        // Called by the WebAppModel
        controlChanged(_viModel, _controlModel, _propertyName, _newValue, _oldValue) {
        }
        // Called by the WebAppModel
        controlEventOccurred(_viModel, _controlModel, _eventName, _eventData) {
        }
        // Called by the WebAppModel
        requestSendControlBounds() {
        }
        // Children should extend to verify their states as needed
        isValidServiceState(state) {
            const isValidState = SERVICE_STATE_ENUM[state] !== undefined;
            return isValidState;
        }
        // State Lifecycle functions
        // Actions performed during initializing occur prior to the initializing of all the pages initial models and viewModels
        //   so only perform actions that behave independently of models and viewmodels
        initialize(expectedState, tasksEnum) {
            const that = this;
            if (expectedState !== SERVICE_STATE_ENUM.UNINITIALIZED) {
                throw new Error('Service must be UNINITIALIZED to run initialize');
            }
            that.verifyServiceStateIs(SERVICE_STATE_ENUM.UNINITIALIZED);
            if (tasksEnum === undefined) {
                tasksEnum = INIT_TASKS_ENUM;
            }
            const initTaskTracker = new NationalInstruments.HtmlVI.TaskTracker(tasksEnum, function initComplete() {
                // Have to complete asynchronously so state transition can propagate
                setTimeout(function () {
                    that.finishInitializing();
                }, 0);
            });
            NationalInstruments.HtmlVI.Elements.NIElement.addNIEventListener('attached', function () {
                initTaskTracker.complete(INIT_TASKS_ENUM.ELEMENTSREADY);
            });
            return initTaskTracker;
        }
        // Finish initializing is called when the page initial models, view models, and elements have been created (the attached callback for all initial elements has been called)
        finishInitializing(expectedState) {
            this.verifyServiceStateIs(expectedState);
        }
        // The framework requires the update service to be in the READY state before allowing start to be called (and assumes start can be called as long as in the ready state)
        start(expectedState) {
            const that = this;
            if (expectedState !== SERVICE_STATE_ENUM.READY) {
                throw new Error('Service must be READY to run start');
            }
            that.verifyServiceStateIs(SERVICE_STATE_ENUM.READY);
            NI_SUPPORT.logVerbose('niUpdateService start()');
            // Used for tests. See IHtmlUpdateService.cs and HtmlVIFrontPanelShellTest (C#)
            that.windowEngineCallbacks.getPropertyValue = function (argsArr) {
                const requestId = argsArr[0];
                const id = argsArr[1];
                const querySelector = argsArr[2];
                const property = argsArr[3];
                let selector = `[ni-control-id='${id}']`;
                if (querySelector !== null) {
                    selector = selector + querySelector;
                }
                const nodes = document.querySelectorAll(selector);
                let result = '';
                if (nodes !== null && nodes.length !== 0) {
                    if (nodes.length > 1) {
                        throw new Error('Query selector found more than one control.  Query selector is ' + selector);
                    }
                    let node = nodes[0];
                    // If we're in an array, check the property value on the cloned controls in the array cells, instead of the
                    // template control. This lets us get more testing / coverage on the array code that applies property updates
                    // to the cloned controls.
                    if (node.parentElement instanceof NationalInstruments.HtmlVI.Elements.ArrayViewer) {
                        // Note: This won't handle array-in-array currently, we'd need to walk up to the rootmost arrayViewer
                        // and get the CSS selector from that one.
                        selector = node.parentElement.getFullCssSelectorForNIVisual(node);
                        if (querySelector !== null) {
                            selector = selector + querySelector;
                        }
                        node = document.querySelector(selector);
                    }
                    if (node !== null) {
                        if (property === 'style') {
                            const style = window.getComputedStyle(node);
                            result = JSON.stringify(style);
                        }
                        else if (property === 'content') {
                            const childHTML = node.firstChild.innerHTML;
                            result = JSON.stringify(childHTML);
                        }
                        else if (property === 'boundingClientRect') {
                            const rect = node.getBoundingClientRect();
                            result = JSON.stringify(rect);
                        }
                        else if (property.startsWith('--')) {
                            // Computed style doesn't contain the value of CSS variables, the way to get the CSS variable value
                            // is to call `getPropertyValue` on computed style of element. (assuming '--' is only used as prefix for CSS variables).
                            const style = window.getComputedStyle(node);
                            result = JSON.stringify(style.getPropertyValue(property).trim(' '));
                        }
                        else if (node[property] !== undefined) {
                            let propVal = node[property];
                            if (propVal instanceof JQX.Utilities.DateTime) {
                                propVal = DATETIME_VAL_CONVERTER.convertBack(propVal);
                            }
                            // JSON can't represent these types
                            if (propVal === Number.POSITIVE_INFINITY || propVal === Number.NEGATIVE_INFINITY || Number.isNaN(propVal)) {
                                propVal = propVal.toString();
                            }
                            result = JSON.stringify(propVal);
                        }
                    }
                }
                window.engine.trigger('GetPropertyValueComplete', requestId, result);
            };
            // Used for tests. See IHtmlUpdateService.cs and HtmlVIFrontPanelShellTest (C#)
            that.windowEngineCallbacks.controlExists = function (argsArr) {
                const requestId = argsArr[0], id = argsArr[1];
                const selector = `ni-front-panel [ni-control-id='${id}']`;
                const nodes = document.querySelectorAll(selector);
                if (nodes.length > 1) {
                    throw new Error('There should only be one instance of a control.  Found multiple controls with id ' + id);
                }
                window.engine.trigger('ControlExistsComplete', requestId, nodes.length === 1);
            };
            // Used for tests. See IHtmlUpdateService.cs and HtmlVIFrontPanelShellTest (C#)
            that.windowEngineCallbacks.indexOfControl = function (argsArr) {
                const requestId = argsArr[0], id = argsArr[1];
                const selector = `ni-front-panel [ni-control-id='${id}']`;
                const node = document.querySelectorAll(selector);
                let index = -1, i;
                if (node.length !== 0) {
                    for (i = 0; i < node[0].parentElement.childNodes.length; i++) {
                        if (node[0].parentElement.childNodes[i] === node[0]) {
                            index = i;
                            break;
                        }
                    }
                }
                window.engine.trigger('IndexOfControlComplete', requestId, index);
            };
            that.windowEngineCallbacks.unregisterPageNavigationListener = function () {
                that.unregisterPageNavigationListener();
                window.engine.trigger('UnregisterPageNavigationListenerComplete');
            };
            if (window.engine !== undefined) {
                window.engine.on(BROWSER_MESSAGE_ENUM.GET_PROPERTY_VALUE, that.windowEngineCallbacks.getPropertyValue);
                window.engine.on(BROWSER_MESSAGE_ENUM.CONTROL_EXISTS, that.windowEngineCallbacks.controlExists);
                window.engine.on(BROWSER_MESSAGE_ENUM.INDEX_OF_CONTROL, that.windowEngineCallbacks.indexOfControl);
                window.engine.on(BROWSER_MESSAGE_ENUM.UNREGISTER_PAGE_NAVIGATION_LISTENER, that.windowEngineCallbacks.unregisterPageNavigationListener);
            }
        }
        stop(expectedState) {
            this.verifyServiceStateIs(expectedState);
            if (window.engine !== undefined) {
                window.engine.off(BROWSER_MESSAGE_ENUM.GET_PROPERTY_VALUE, this.windowEngineCallbacks.getPropertyValue);
                window.engine.off(BROWSER_MESSAGE_ENUM.CONTROL_EXISTS, this.windowEngineCallbacks.controlExists);
                window.engine.off(BROWSER_MESSAGE_ENUM.INDEX_OF_CONTROL, this.windowEngineCallbacks.indexOfControl);
                window.engine.off(BROWSER_MESSAGE_ENUM.UNREGISTER_PAGE_NAVIGATION_LISTENER, this.windowEngineCallbacks.unregisterPageNavigationListener);
            }
            this.windowEngineCallbacks.getPropertyValue = undefined;
            this.windowEngineCallbacks.controlExists = undefined;
            this.windowEngineCallbacks.indexOfControl = undefined;
            this.windowEngineCallbacks.unregisterPageNavigationListener = undefined;
        }
        registerPageNavigationListener() {
            const that = this;
            if (that.isInIdeMode()) {
                that.pageNavigationListener = function (e) {
                    let url, target;
                    if (document.activeElement instanceof HTMLAnchorElement) {
                        url = document.activeElement.href;
                        target = document.activeElement.target;
                    }
                    window.engine.trigger(BROWSER_MESSAGE_ENUM.NAVIGATION_ATTEMPTED, url, target);
                    // Setting returnValue and returning a string allows C# to handle the beforeunload
                    // event and use it to disallow page navigation while we're running.
                    // Note: Currently the returned string is not the same string we get on the C# side
                    // (it's supposed to be the text for the confirmation dialog), so we're just using
                    // empty string. That also means there's no way to pass back the URL of any link you
                    // may have clicked via beforeunload, which is why we also fire a NavigationAttempted
                    // event with that information.
                    e.returnValue = '';
                    return e.returnValue;
                };
                window.addEventListener('beforeunload', that.pageNavigationListener);
            }
        }
        unregisterPageNavigationListener() {
            if (this.pageNavigationListener !== undefined) {
                window.removeEventListener('beforeunload', this.pageNavigationListener);
                this.pageNavigationListener = undefined;
            }
        }
    }
    NationalInstruments.HtmlVI.UpdateService = UpdateService;
    const SERVICE_STATE_ENUM = NationalInstruments.HtmlVI.WebApplicationStates.ServiceStateEnum;
    const INIT_TASKS_ENUM = NationalInstruments.HtmlVI.UpdateService.InitTasksEnum;
    const BROWSER_MESSAGE_ENUM = NationalInstruments.HtmlVI.UpdateService.BrowserMessagesEnum;
}());
//# sourceMappingURL=niUpdateService.js.map