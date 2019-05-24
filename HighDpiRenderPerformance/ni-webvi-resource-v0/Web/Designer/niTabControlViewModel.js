"use strict";
//****************************************
// Boolean Button View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const MathHelpers = NationalInstruments.HtmlVI.MathHelpers;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const TabControlModel = NationalInstruments.HtmlVI.Models.TabControlModel;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class TabControlViewModel extends NationalInstruments.HtmlVI.ViewModels.LayoutControlViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('tabStripPlacement');
        }
        bindToView() {
            super.bindToView();
            const that = this;
            that.element.addEventListener('selected-index-changed', function (event) {
                if (event.target === that.element) {
                    const newValue = event.detail.selectedIndex;
                    that.model.controlChanged(newValue);
                    that.model.requestSendControlBounds();
                }
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'selectedIndex':
                    renderBuffer.properties.selectedIndexNonSignaling = this.model.selectedIndex;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.selectedIndex = this.element.selectedIndex;
            this.model.defaultValue = this.element.selectedIndex;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.selectedIndex = this.model.selectedIndex;
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.selectedIndex = clampForValue(gPropertyValue, model.childModels.length);
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(clampForValue(gPropertyValue, model.childModels.length));
                    break;
                case TabControlModel.ACTIVE_TAB_G_PROPERTY_NAME:
                    {
                        if (gPropertyValue < 0 || gPropertyValue >= model.childModels.length) {
                            throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_OUT_OF_RANGE', gPropertyName, model.childModels.length - 1));
                        }
                        else {
                            model.activeTab = gPropertyValue;
                        }
                        break;
                    }
                case TabControlModel.TAB_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CANNOT_BE_SET', gPropertyName));
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.selectedIndex;
                case TabControlModel.ACTIVE_TAB_G_PROPERTY_NAME:
                    return model.activeTab;
                case TabControlModel.TAB_G_PROPERTY_NAME:
                    {
                        const activeTabModel = model.childModels[model.activeTab];
                        return activeTabModel.rootOwner.getControlViewModel(activeTabModel.niControlId);
                    }
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    const clampForValue = function (gPropertyValue, itemLength) {
        return MathHelpers.clamp(gPropertyValue, 0, itemLength - 1);
    };
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(TabControlViewModel, NationalInstruments.HtmlVI.Elements.TabControl, NationalInstruments.HtmlVI.Models.TabControlModel);
    NationalInstruments.HtmlVI.ViewModels.TabControlViewModel = TabControlViewModel;
})();
//# sourceMappingURL=niTabControlViewModel.js.map