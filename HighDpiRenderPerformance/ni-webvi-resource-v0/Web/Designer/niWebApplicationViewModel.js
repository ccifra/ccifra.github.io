"use strict";
//****************************************
// Web Application View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const SERVICE_STATE_ENUM = NationalInstruments.HtmlVI.WebApplicationStates.ServiceStateEnum;
    // Static Private Functions
    // TODO mraj niskipsync used for development only until we have improved deployment testing
    const isBrowserPreventEditorModeEnabled = function () {
        const preventEditorMode = (window.location.hash.indexOf('niskipsync') !== -1);
        return preventEditorMode;
    };
    class WebApplicationViewModel extends NationalInstruments.HtmlVI.ViewModels.NIViewModel {
        // Constructor Function
        constructor(element, model) {
            super(element, model);
            if (this.model instanceof NationalInstruments.HtmlVI.Models.WebApplicationModel === false) {
                throw new Error(NI_SUPPORT.i18n('msg_INVALID_VI_MODEL'));
            }
            if (this.element instanceof NationalInstruments.HtmlVI.Elements.WebApplication === false) {
                throw new Error(NI_SUPPORT.i18n('msg_INVALID_ELEMENT'));
            }
            // Public Instance Properties
            // None
            // Private Instance Properties
            this._autoStartOccurred = false;
        }
        // Public Prototype Methods
        bindToView() {
            super.bindToView();
            const that = this;
            NI_SUPPORT.logVerbose('niWebApplicationViewModel bindToView()');
            that.element.addEventListener('requested-start', function (evt) {
                NI_SUPPORT.logVerbose('niWebApplicationViewModel requested-start');
                if (that.element === evt.detail.element) {
                    that.model.start();
                }
            });
            that.element.addEventListener('requested-stop', function (evt) {
                NI_SUPPORT.logVerbose('niWebApplicationViewModel requested-stop');
                if (that.element === evt.detail.element) {
                    that.model.stop();
                }
            });
            that.model.initializeService();
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            const that = this;
            switch (propertyName) {
                case 'serviceState':
                    // Assign to the element directly as renderBuffer is buffered and debounced so may lose samples
                    that.element.serviceState = that.model.serviceState;
                    NI_SUPPORT.logVerbose('niWebApplicationViewModel modelPropertyChanged serviceState=' + that.model.serviceState);
                    if (that.model.checkServiceStateIs(SERVICE_STATE_ENUM.READY) && that.model.disableAutoStart === false && that._autoStartOccurred === false) {
                        that._autoStartOccurred = true;
                        that.model.start();
                    }
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const model = this.model, element = this.element;
            model.engine = element.engine;
            model.location = element.location;
            model.vireoSource = element.vireoSource;
            model.wasmUrl = element.wasmUrl;
            model.remoteAddress = element.remoteAddress;
            model.testMode = element.testMode;
            model.disableAutoStart = element.disableAutoStart;
            model.serviceState = element.serviceState;
            model.maximumErrorMessageCount = element.maximumErrorMessageCount;
            // Gets this parameter from the view, but not the element. Until we support deployment from the IDE,
            // the only way to set the page to "deployed"/"browser" mode is via the custom #niskipsync url
            if (isBrowserPreventEditorModeEnabled()) {
                model.location = '';
                model.engine = '';
                model.testMode = true;
            }
        }
    }
    NationalInstruments.HtmlVI.ViewModels.WebApplicationViewModel = WebApplicationViewModel;
})();
//# sourceMappingURL=niWebApplicationViewModel.js.map