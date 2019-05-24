"use strict";
//****************************************
// Label View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    const LabelModel = NationalInstruments.HtmlVI.Models.LabelModel;
    class LabelViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('text');
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'text':
                    this.model.requestSendControlBounds();
                    break;
                case 'labelAlignment':
                    this.model.requestSendControlBounds();
                    break;
            }
            return renderBuffer;
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case LabelModel.TEXT_G_PROPERTY_NAME:
                    model.text = gPropertyValue;
                    break;
                case VisualModel.POSITION_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CANNOT_BE_SET', gPropertyName));
                case VisualModel.SIZE_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CANNOT_BE_SET', gPropertyName));
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case LabelModel.TEXT_G_PROPERTY_NAME:
                    return model.text;
                case VisualModel.SIZE_G_PROPERTY_NAME:
                    // CAR:718175
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CANNOT_BE_GET', gPropertyName));
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
        isFollower() {
            return true;
        }
        shouldUseTranslate() {
            return true;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(LabelViewModel, NationalInstruments.HtmlVI.Elements.Label, NationalInstruments.HtmlVI.Models.LabelModel);
    NationalInstruments.HtmlVI.ViewModels.LabelViewModel = LabelViewModel;
})();
//# sourceMappingURL=niLabelViewModel.js.map