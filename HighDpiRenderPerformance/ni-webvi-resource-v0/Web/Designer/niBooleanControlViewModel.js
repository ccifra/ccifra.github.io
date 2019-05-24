"use strict";
//****************************************
// Boolean Control View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const ColorHelpers = NationalInstruments.HtmlVI.ValueConverters.ColorValueConverters;
    const BooleanControlModel = NationalInstruments.HtmlVI.Models.BooleanControlModel;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class BooleanControlViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        convertModelClickModeToJQXClickMode() {
            if (this.model.momentary === false && this.model.clickMode !== 'press') {
                return 'release';
            }
            else if (this.model.momentary === false && this.model.clickMode === 'press') {
                return 'press';
            }
            else if (this.model.momentary === true && this.model.clickMode !== 'press') {
                return 'pressAndRelease';
            }
            // instead of throwing an exception for invalid combinations we ignore them
            // this is because properties come from the editor one at a time and so can produce
            // temporary invalid combos
            return '';
        }
        setModelClickModeFromJQXClickMode() {
            if (this.element.clickMode === 'release') {
                this.model.momentary = false;
                this.model.clickMode = 'release';
            }
            else if (this.element.clickMode === 'press') {
                this.model.momentary = false;
                this.model.clickMode = 'press';
            }
            else if (this.element.clickMode === 'pressAndRelease') {
                this.model.momentary = true;
                this.model.clickMode = 'release';
            }
        }
        getReadOnlyPropertyName() {
            return 'readonly';
        }
        modelPropertyChanged(propertyName) {
            let clickMode;
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'momentary':
                case 'clickMode':
                    clickMode = this.convertModelClickModeToJQXClickMode();
                    if (clickMode !== '') {
                        renderBuffer.properties.clickMode = clickMode;
                    }
                    break;
                case 'content':
                    // do not set content here
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.setModelClickModeFromJQXClickMode();
            // do not set content
        }
        applyModelToElement() {
            super.applyModelToElement();
            // do not update content here - some derived elements will stomp parts if content is set
            this.element.clickMode = this.convertModelClickModeToJQXClickMode();
            // do not set content
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.value = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(gPropertyValue);
                    break;
                case BooleanControlModel.TEXT_G_PROPERTY_NAME: {
                    const indexOfContent = 0;
                    // set the content only if it is a non-empty array
                    if (gPropertyValue.length > indexOfContent) {
                        model.content = NI_SUPPORT.escapeHtml(gPropertyValue[indexOfContent]);
                    }
                    break;
                }
                case BooleanControlModel.TRUE_COLOR_G_PROPERTY_NAME:
                    model.trueBackground = ColorHelpers.integerToRGBA(gPropertyValue);
                    break;
                case BooleanControlModel.FALSE_COLOR_G_PROPERTY_NAME:
                    model.falseBackground = ColorHelpers.integerToRGBA(gPropertyValue);
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.value;
                case BooleanControlModel.TEXT_G_PROPERTY_NAME:
                    return [NI_SUPPORT.unescapeHtml(model.content)];
                case BooleanControlModel.TRUE_COLOR_G_PROPERTY_NAME:
                    {
                        const trueBackgroundColor = model.trueBackground;
                        if (ColorHelpers.isRGBAOrHexFormat(trueBackgroundColor)) {
                            return ColorHelpers.getIntegerValueForInputColor(trueBackgroundColor);
                        }
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_WITH_GRADIENT_COLOR_NOT_SUPPORTED', gPropertyName));
                    }
                case BooleanControlModel.FALSE_COLOR_G_PROPERTY_NAME:
                    {
                        const falseBackgroundColor = model.falseBackground;
                        if (ColorHelpers.isRGBAOrHexFormat(falseBackgroundColor)) {
                            return ColorHelpers.getIntegerValueForInputColor(falseBackgroundColor);
                        }
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_WITH_GRADIENT_COLOR_NOT_SUPPORTED', gPropertyName));
                    }
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.ViewModels.BooleanControlViewModel = BooleanControlViewModel;
})();
//# sourceMappingURL=niBooleanControlViewModel.js.map