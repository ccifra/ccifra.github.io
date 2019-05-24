"use strict";
//****************************************
// Text View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    const TextModel = NationalInstruments.HtmlVI.Models.TextModel;
    class TextViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
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
                case 'textAlignment':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN] = this.model.textAlignment;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const model = this.model, element = this.element;
            const style = window.getComputedStyle(element);
            model.textAlignment = style.getPropertyValue(CSS_PROPERTIES.TEXT_ALIGN);
            model.defaultValue = element.text;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN, this.model.textAlignment);
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case TextModel.TEXT_G_PROPERTY_NAME:
                    model.text = gPropertyValue;
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case TextModel.TEXT_G_PROPERTY_NAME:
                    return model.text;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(TextViewModel, NationalInstruments.HtmlVI.Elements.Text, NationalInstruments.HtmlVI.Models.TextModel);
    NationalInstruments.HtmlVI.ViewModels.TextViewModel = TextViewModel;
})();
//# sourceMappingURL=niTextViewModel.js.map