"use strict";
//****************************************
// EnumSelector View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const TEXTALIGN_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.TextAlignmentValueConverter;
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const NumericValueSelectorModel = NationalInstruments.HtmlVI.Models.NumericValueSelectorModel;
    class EnumSelectorViewModel extends NationalInstruments.HtmlVI.ViewModels.NumericValueSelectorViewModel {
        modelPropertyChanged(propertyName) {
            const that = this;
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'textAlignment':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN_AS_FLEX] = TEXTALIGN_VAL_CONVERTER.convertTextAlignmentToFlexAlignment(that.model.textAlignment);
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN] = that.model.textAlignment;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const elementStyle = window.getComputedStyle(this.element);
            this.model.textAlignment = elementStyle.getPropertyValue(CSS_PROPERTIES.TEXT_ALIGN);
        }
        applyModelToElement() {
            super.applyModelToElement();
            const justifyContent = TEXTALIGN_VAL_CONVERTER.convertTextAlignmentToFlexAlignment(this.model.textAlignment);
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN_AS_FLEX, justifyContent);
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN, this.model.textAlignment);
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            switch (gPropertyName) {
                case NumericValueSelectorModel.ITEMS_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_NOT_SUPPORTED', gPropertyName));
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            switch (gPropertyName) {
                case NumericValueSelectorModel.ITEMS_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_NOT_SUPPORTED', gPropertyName));
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(EnumSelectorViewModel, NationalInstruments.HtmlVI.Elements.EnumSelector, NationalInstruments.HtmlVI.Models.EnumSelectorModel);
    NationalInstruments.HtmlVI.ViewModels.EnumSelectorViewModel = EnumSelectorViewModel;
})();
//# sourceMappingURL=niEnumSelectorViewModel.js.map