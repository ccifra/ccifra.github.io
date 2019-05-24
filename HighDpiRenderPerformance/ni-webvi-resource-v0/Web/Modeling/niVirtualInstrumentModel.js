"use strict";
//****************************************
// VI Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const EDITOR_ADAPTERS = NationalInstruments.HtmlVI.NIEditorDataAdapters;
    const IRootModel = NationalInstruments.HtmlVI.Models.IRootModel;
    class VirtualInstrumentModel extends NationalInstruments.HtmlVI.Models.NIModel {
        constructor(id, webAppModel) {
            super(id);
            this.controlModels = {};
            this.controlViewModels = {};
            this._viName = undefined;
            this.__viRef = undefined;
            this._frontPanelControlId = undefined;
            this._webAppModel = webAppModel;
        }
        get [IRootModel.NIRootModelSymbol]() {
            return true;
        }
        get viName() {
            return this._viName;
        }
        set viName(value) {
            if (this._viName !== value || value !== undefined) {
                this._viName = value;
                this.notifyModelPropertyChanged('viName');
            }
            else {
                throw new Error('Cannot change viName after it has been assigned a valid value');
            }
        }
        get viRef() {
            return this._viRef;
        }
        set viRef(value) {
            if (this._viRef !== value || value !== undefined) {
                this._viRef = value;
                this.notifyModelPropertyChanged('viRef');
            }
            else {
                throw new Error('Cannot change viRef after it has been assigned a valid value');
            }
        }
        detachFromWebApp() {
            this._webAppModel = undefined;
        }
        // The Owner of a VI is not the web application, to get the web application call getOwningWebApplication
        getOwner() {
            return undefined;
        }
        getOwningWebApplication() {
            return this._webAppModel;
        }
        // NOTE: SHOULD NOT BE CALLED DIRECTLY, USED BY niElementExtensions
        // Creates the Model and ViewModel for the provided element
        // Assumes the element is already inserted in the DOM, the element location in the DOM reflects parenting, and the parent Model and ViewModel are already created
        addFrontPanelControlModel(element) {
            if (!NI_SUPPORT.isElement(element)) {
                throw new Error('Only Html Custom Elements can be registered to a Virtual Instrument');
            }
            if (this.viRef !== element.viRef) {
                throw new Error('The element with ni-control-id "' + element.niControlId + '" and with vi-ref "' + element.viRef + '" is trying to incorrectly register with a VI with vi-ref "' + this.viRef + '"');
            }
            const controlElements = NI_SUPPORT.queryAllControlsByNIControlId(element.viRef, element.niControlId);
            const niControlId = element.niControlId;
            if (niControlId === '' || controlElements.length !== 1) {
                throw new Error('Element with niControlId=' + niControlId + ' must have a unique niControlId to be registered to this VI');
            }
            // Verify a Model or ViewModel with this id does not already exists
            if (this.controlModels[niControlId] !== undefined || this.controlViewModels[niControlId] !== undefined) {
                throw new Error('The model or viewmodel for this control already exists (' + niControlId + ')');
            }
            if (element.elementInfo.tagName === 'ni-front-panel') {
                if (this._frontPanelControlId !== undefined) {
                    throw new Error('The front panel Control ID for this panel is already set to ' + this._frontPanelControlId);
                }
                this._frontPanelControlId = niControlId;
            }
            // Find parent (either another visualComponent or if none are found then this Model)
            let currParent, parentModel = this;
            for (currParent = element.parentElement; currParent !== null; currParent = currParent.parentElement) {
                if (NI_SUPPORT.isElement(currParent)) {
                    parentModel = this.controlViewModels[currParent.niControlId].model;
                    break;
                }
            }
            // Create the Model
            // TODO mraj in the future the _temporaryModelSettingsHolder should include the model name and the ViewModel can be looked up from model and element tagName
            const modelKind = NationalInstruments.HtmlVI.NIModelProvider.tagNameToModelKind(element.elementInfo.tagName);
            const controlModel = NationalInstruments.HtmlVI.NIModelProvider.makeModel(modelKind, niControlId);
            controlModel.setOwner(parentModel);
            if (parentModel instanceof NationalInstruments.HtmlVI.Models.VisualModel) {
                parentModel.addChildModel(controlModel);
            }
            if (element._temporaryModelSettingsHolder !== undefined) {
                controlModel.setMultipleProperties(element._temporaryModelSettingsHolder, EDITOR_ADAPTERS.editorToJsModel);
            }
            // Create the ViewModel
            const controlViewModel = NationalInstruments.HtmlVI.NIModelProvider.makeViewModel(element, controlModel);
            if (element._temporaryModelSettingsHolder !== undefined) {
                controlViewModel.applyModelToElement();
                element._temporaryModelSettingsHolder = undefined;
            }
            else {
                controlViewModel.updateModelFromElement();
            }
            // Complete Model - ViewModel binding
            controlModel.registerListener(controlViewModel);
            // Save the model and viewmodel
            this.controlModels[niControlId] = controlModel;
            this.controlViewModels[niControlId] = controlViewModel;
            NI_SUPPORT.infoVerbose('add Model ' + niControlId);
            return {
                controlModel: controlModel,
                controlViewModel: controlViewModel
            };
        }
        // NOTE: SHOULD NOT BE CALLED DIRECTLY, USED BY niElementExtensions
        // Remove the Model and ViewModel for the provided element
        removeFrontPanelControl(element) {
            if (!NI_SUPPORT.isElement(element)) {
                throw new Error('Only Visual Component Elements can be unregistered from a Virtual Instrument');
            }
            const niControlId = element.niControlId;
            const controlModel = this.controlModels[niControlId];
            const controlViewModel = this.controlViewModels[niControlId];
            if (controlModel instanceof NationalInstruments.HtmlVI.Models.VisualComponentModel === false ||
                controlViewModel instanceof NationalInstruments.HtmlVI.ViewModels.VisualComponentViewModel === false) {
                throw new Error('This VIModel does not contain a control with niControlId: ' + niControlId);
            }
            NI_SUPPORT.infoVerbose('remove Model ' + niControlId);
            if (controlModel.getOwner() instanceof NationalInstruments.HtmlVI.Models.VisualModel) {
                controlModel.getOwner().removeChildModel(controlModel);
            }
            controlModel.unregisterListener(controlViewModel);
            delete this.controlModels[niControlId];
            delete this.controlViewModels[niControlId];
            if (this._frontPanelControlId === niControlId) {
                this._frontPanelControlId = undefined;
            }
            return {
                controlModel: controlModel,
                controlViewModel: controlViewModel
            };
        }
        getControlViewModel(id) {
            return this.controlViewModels[id];
        }
        getControlModel(id) {
            return this.controlModels[id];
        }
        getAllControlModels() {
            return this.controlModels;
        }
        getFrontPanelControlModel() {
            return this.controlModels[this._frontPanelControlId];
        }
        getFrontPanelControlViewModel() {
            return this.controlViewModels[this._frontPanelControlId];
        }
        processControlUpdate(niControlId, properties, typedValueAdapter) {
            const controlModel = this.controlModels[niControlId];
            if (controlModel !== undefined) {
                controlModel.setMultipleProperties(properties, typedValueAdapter);
            }
            else {
                NI_SUPPORT.infoVerbose('Cannot find the control model with id (' + niControlId + ') to update the properties(' + Object.keys(properties).join(',') + ')');
            }
        }
        processControlUpdateToSetGPropertyValue(controlId, gPropertyName, gPropertyValue) {
            const controlViewModel = this.controlViewModels[controlId];
            if (controlViewModel !== undefined) {
                controlViewModel.setGPropertyValue(gPropertyName, gPropertyValue);
            }
            else {
                throw new Error('Cannot find the control view model with id (' + controlId + ') to update the value of (' + gPropertyName + ')');
            }
        }
        processControlUpdateToGetGPropertyValue(controlId, gPropertyName) {
            const controlViewModel = this.controlViewModels[controlId];
            if (controlViewModel !== undefined) {
                return controlViewModel.getGPropertyValue(gPropertyName);
            }
            else {
                throw new Error('Cannot find the control view model with id (' + controlId + ') to get value of (' + gPropertyName + ')');
            }
        }
        invokeControlFunction(controlId, functionName, args) {
            const controlViewModel = this.controlViewModels[controlId];
            if (controlViewModel !== undefined) {
                return controlViewModel.invokeInternalControlFunction(functionName, args);
            }
            else {
                throw new Error('Cannot find the control view model with id (' + controlId + ') to call method (' + functionName + ')');
            }
        }
        controlChanged(controlModel, propertyName, newValue, oldValue) {
            const webAppModel = this.getOwningWebApplication();
            webAppModel.controlChanged(this, controlModel, propertyName, newValue, oldValue);
        }
        internalControlEventOccurred(controlModel, eventName, data) {
            const webAppModel = this.getOwningWebApplication();
            webAppModel.internalControlEventOccurred(this, controlModel, eventName, data);
        }
        controlEventOccurred(controlModel, eventName, eventData) {
            const webAppModel = this.getOwningWebApplication();
            webAppModel.controlEventOccurred(this, controlModel, eventName, eventData);
        }
        requestSendControlBounds() {
            const webAppModel = this.getOwningWebApplication();
            webAppModel.requestSendControlBounds();
        }
        getNameVireoEncoded() {
            return window.vireoHelpers.staticHelpers.encodeIdentifier(this.viName);
        }
        enableEvents() {
            const webAppModel = this.getOwningWebApplication();
            return webAppModel.enableEvents();
        }
    }
    NationalInstruments.HtmlVI.Models.VirtualInstrumentModel = VirtualInstrumentModel;
}());
//# sourceMappingURL=niVirtualInstrumentModel.js.map