"use strict";
//****************************************
// Front Panel View Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    const USER_INTERACTION_STATE_ENUM = NationalInstruments.HtmlVI.EditorInteractionStates.UserInteractionState;
    const INTERACTIVE_OPERATION_KIND_ENUM = NationalInstruments.HtmlVI.EditorInteractionStates.InteractiveOperationKind;
    const ColorHelpers = NationalInstruments.HtmlVI.ValueConverters.ColorValueConverters;
    const FrontPanelModel = NationalInstruments.HtmlVI.Models.FrontPanelModel;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class FrontPanelViewModel extends NationalInstruments.HtmlVI.ViewModels.LayoutControlViewModel {
        userInteractionChanged(newState, operationKind) {
            const isMoveOrCreate = operationKind === INTERACTIVE_OPERATION_KIND_ENUM.MOVE ||
                operationKind === INTERACTIVE_OPERATION_KIND_ENUM.CREATE;
            if (newState === USER_INTERACTION_STATE_ENUM.START) {
                if (isMoveOrCreate) {
                    this.element.classList.add('ni-descendant-drag-active');
                }
            }
            else if (newState === USER_INTERACTION_STATE_ENUM.END) {
                if (isMoveOrCreate) {
                    this.element.classList.remove('ni-descendant-drag-active');
                }
            }
        }
        bindToView() {
            super.bindToView();
            const that = this;
            window.addEventListener('online', function (e) {
                that.model.controlEventOccurred(FrontPanelModel.ONLINE_STATUS_CHANGED_EVENT_NAME, { "Connected?": true });
            });
            window.addEventListener('offline', function (e) {
                that.model.controlEventOccurred(FrontPanelModel.ONLINE_STATUS_CHANGED_EVENT_NAME, { "Connected?": false });
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'maxWidth':
                    renderBuffer.cssStyles[CSS_PROPERTIES.MAX_WIDTH] = this.model.maxWidth;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const model = this.model, element = this.element;
            const style = window.getComputedStyle(element);
            model.maxWidth = style.getPropertyValue(CSS_PROPERTIES.MAX_WIDTH);
        }
        applyModelToElement() {
            super.applyModelToElement();
            const model = this.model, element = this.element;
            element.style.setProperty(CSS_PROPERTIES.MAX_WIDTH, model.maxWidth);
        }
        shouldElementUseModelHeight() {
            return !this.model.isFlexibleLayoutRoot();
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case FrontPanelModel.BACKGROUND_COLOR_G_PROPERTY_NAME:
                    model.background = ColorHelpers.integerToRGBA(gPropertyValue);
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case FrontPanelModel.BACKGROUND_COLOR_G_PROPERTY_NAME:
                    {
                        const background = model.background;
                        if (ColorHelpers.isRGBAOrHexFormat(background)) {
                            return ColorHelpers.getIntegerValueForInputColor(background);
                        }
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_WITH_GRADIENT_COLOR_NOT_SUPPORTED', gPropertyName));
                    }
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(FrontPanelViewModel, null, NationalInstruments.HtmlVI.Models.FrontPanelModel, 'ni-front-panel');
    NationalInstruments.HtmlVI.ViewModels.FrontPanelViewModel = FrontPanelViewModel;
})();
//# sourceMappingURL=niFrontPanelViewModel.js.map