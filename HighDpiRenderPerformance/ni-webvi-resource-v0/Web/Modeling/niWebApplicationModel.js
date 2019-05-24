"use strict";
//****************************************
// Web Application Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const SERVICE_STATE_ENUM = NationalInstruments.HtmlVI.WebApplicationStates.ServiceStateEnum;
    const PANEL_ENGINE_ENUM = NationalInstruments.HtmlVI.WebApplicationStates.PanelEngineEnum;
    const PANEL_LOCATION_ENUM = NationalInstruments.HtmlVI.WebApplicationStates.PanelLocationEnum;
    let currWebAppInstanceId = 0;
    const _TasksEnum = Object.freeze({
        SERVICE: 'SERVICE',
        ELEMENTS: 'ELEMENTS'
    });
    class WebApplicationModel extends NationalInstruments.HtmlVI.Models.NIModel {
        constructor(id) {
            super(id);
            this.updateService = undefined;
            this.initTasks = undefined;
            NI_SUPPORT.defineConstReference(this, 'webAppInstanceId', currWebAppInstanceId++);
            this._engine = PANEL_ENGINE_ENUM.VIREO;
            this._location = PANEL_LOCATION_ENUM.BROWSER;
            this._vireoSource = '';
            this._wasmUrl = '';
            this._remoteAddress = '';
            this._testMode = false;
            this._disableAutoStart = false;
            this._serviceState = SERVICE_STATE_ENUM.UNINITIALIZED;
            this._maximumErrorMessageCount = 100;
            this._viModels = [];
        }
        get engine() {
            return this._engine;
        }
        set engine(value) {
            this._engine = value;
            this.notifyModelPropertyChanged('engine');
        }
        get location() {
            return this._location;
        }
        set location(value) {
            this._location = value;
            this.notifyModelPropertyChanged('location');
        }
        get vireoSource() {
            return this._vireoSource;
        }
        set vireoSource(value) {
            this._vireoSource = value;
            this.notifyModelPropertyChanged('vireoSource');
        }
        get wasmUrl() {
            return this._wasmUrl;
        }
        set wasmUrl(value) {
            this._wasmUrl = value;
            this.notifyModelPropertyChanged('wasmUrl');
        }
        get remoteAddress() {
            return this._remoteAddress;
        }
        set remoteAddress(value) {
            this._remoteAddress = value;
            this.notifyModelPropertyChanged('remoteAddress');
        }
        get testMode() {
            return this._testMode;
        }
        set testMode(value) {
            this._testMode = value;
            this.notifyModelPropertyChanged('testMode');
        }
        get disableAutoStart() {
            return this._disableAutoStart;
        }
        set disableAutoStart(value) {
            this._disableAutoStart = value;
            this.notifyModelPropertyChanged('disableAutoStart');
        }
        get serviceState() {
            return this._serviceState;
        }
        set serviceState(value) {
            this._serviceState = value;
            this.notifyModelPropertyChanged('serviceState');
        }
        get maximumErrorMessageCount() {
            return this._maximumErrorMessageCount;
        }
        set maximumErrorMessageCount(value) {
            this._maximumErrorMessageCount = value;
            this.notifyModelPropertyChanged('maximumErrorMessageCount');
        }
        static get TasksEnum() {
            return _TasksEnum;
        }
        setServiceState(state) {
            if (this.updateService.isValidServiceState(state) === false) {
                throw new Error('the provided state (' + state + ') is not a valid service state');
            }
            this.serviceState = state;
        }
        verifyServiceStateIs(verifyState) {
            let i, currState;
            if (Array.isArray(verifyState) === false) {
                verifyState = [verifyState];
            }
            for (i = 0; i < verifyState.length; i = i + 1) {
                currState = verifyState[i];
                if (this.updateService.isValidServiceState(currState) === false) {
                    throw new Error('the provided state (' + currState + ') is not a valid service state');
                }
                if (this.serviceState === currState) {
                    return;
                }
            }
            throw new Error('ni-web-application update service in state(' + this.serviceState + ') must be in one of the possible states (' + verifyState.join() + ') to continue');
        }
        checkServiceStateIs(checkState) {
            let i, currState;
            if (Array.isArray(checkState) === false) {
                checkState = [checkState];
            }
            for (i = 0; i < checkState.length; i = i + 1) {
                currState = checkState[i];
                if (this.updateService.isValidServiceState(currState) === false) {
                    throw new Error('the provided state (' + currState + ') is not a valid service state');
                }
                if (this.serviceState === currState) {
                    return true;
                }
            }
            return false;
        }
        getWebAppServiceStateProvider() {
            const that = this;
            return {
                setServiceState: function (state) {
                    that.setServiceState(state);
                },
                verifyServiceStateIs: function (state) {
                    that.verifyServiceStateIs(state);
                },
                checkServiceStateIs: function (state) {
                    return that.checkServiceStateIs(state);
                }
            };
        }
        getVirtualInstrumentModelsProvider() {
            const that = this;
            return {
                getVIModels: function () {
                    return that._viModels;
                }
            };
        }
        attachVIModel(viModel) {
            this._viModels[viModel.viName] = viModel;
        }
        detachVIModel(viModel) {
            if (this._viModels.indexOf(viModel) >= 0) {
                this._viModels.splice(this._viModels.indexOf(viModel), 1);
            }
        }
        initializeService() {
            const that = this;
            const config = {
                remoteAddress: that.remoteAddress,
                vireoSource: that.vireoSource,
                runningInIDE: that.location === PANEL_LOCATION_ENUM.IDE_RUN,
                maximumErrorMessageCount: that.maximumErrorMessageCount,
                wasmUrl: that.wasmUrl
            };
            const updateServiceTable = {};
            updateServiceTable[PANEL_LOCATION_ENUM.IDE_EDIT] = {};
            updateServiceTable[PANEL_LOCATION_ENUM.IDE_RUN] = {};
            updateServiceTable[PANEL_LOCATION_ENUM.BROWSER] = {};
            updateServiceTable[PANEL_LOCATION_ENUM.IDE_EDIT][PANEL_ENGINE_ENUM.NATIVE] = NationalInstruments.HtmlVI.EditorUpdateService;
            updateServiceTable[PANEL_LOCATION_ENUM.IDE_RUN][PANEL_ENGINE_ENUM.NATIVE] = NationalInstruments.HtmlVI.EditorRuntimeUpdateService;
            updateServiceTable[PANEL_LOCATION_ENUM.BROWSER][PANEL_ENGINE_ENUM.NATIVE] = NationalInstruments.HtmlVI.RemoteUpdateService;
            updateServiceTable[PANEL_LOCATION_ENUM.IDE_EDIT][PANEL_ENGINE_ENUM.VIREO] = NationalInstruments.HtmlVI.EditorUpdateService;
            updateServiceTable[PANEL_LOCATION_ENUM.IDE_RUN][PANEL_ENGINE_ENUM.VIREO] = NationalInstruments.HtmlVI.LocalUpdateService;
            updateServiceTable[PANEL_LOCATION_ENUM.BROWSER][PANEL_ENGINE_ENUM.VIREO] = NationalInstruments.HtmlVI.LocalUpdateService;
            // Create the update service we need, not the one we deserve
            if (updateServiceTable[that.location] !== undefined && updateServiceTable[that.location][that.engine] !== undefined) {
                that.updateService = new updateServiceTable[that.location][that.engine](config);
            }
            else if (that.testMode === true) {
                that.updateService = new NationalInstruments.HtmlVI.TestUpdateService(config);
            }
            else {
                throw new Error('Invalid web app configuration, cannot start a service!');
            }
            that.verifyServiceStateIs(SERVICE_STATE_ENUM.UNINITIALIZED);
            that.updateService.applyWebAppServiceStateProvider(that.getWebAppServiceStateProvider());
            that.updateService.applyVirtualInstrumentModelsProvider(that.getVirtualInstrumentModelsProvider());
            // TODO mraj without the timeout the attachedCallback will synchronously try and update the service state as the
            // update service transitions from Uninitialized to Downloading / Initializing / etc. Doing this synchronously seems to trigger
            // the error before mentioned in ni-element.js in attributeChangedCallback for the case currVal !== newVal.
            // It seems like needing the setTimeout to move to a separate call stack from attachedCallback should be a bug in Chrome...
            setTimeout(function () {
                that.updateService.initialize();
            }, 0);
        }
        start() {
            this.updateService.start();
        }
        stop() {
            this.updateService.stop();
        }
        controlChanged(viModel, controlModel, propertyName, newValue, oldValue) {
            if (this.updateService !== undefined) {
                this.updateService.controlChanged(viModel, controlModel, propertyName, newValue, oldValue);
            }
        }
        internalControlEventOccurred(viModel, controlModel, eventName, eventData) {
            if (this.updateService !== undefined) {
                this.updateService.internalControlEventOccurred(viModel, controlModel, eventName, eventData);
            }
        }
        controlEventOccurred(viModel, controlModel, eventName, eventData) {
            if (this.updateService !== undefined) {
                this.updateService.controlEventOccurred(viModel, controlModel, eventName, eventData);
            }
        }
        enableEvents() {
            if (this.updateService !== undefined) {
                return (this.updateService.enableEvents === true);
            }
            return false;
        }
        requestSendControlBounds() {
            if (this.updateService !== undefined) {
                this.updateService.requestSendControlBounds();
            }
        }
    }
    NationalInstruments.HtmlVI.Models.WebApplicationModel = WebApplicationModel;
}());
//# sourceMappingURL=niWebApplicationModel.js.map