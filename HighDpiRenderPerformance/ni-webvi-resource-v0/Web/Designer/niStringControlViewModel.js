"use strict";
//****************************************
// String Control View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    const StringControlModel = NationalInstruments.HtmlVI.Models.StringControlModel;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    const textDisplayMode = NationalInstruments.HtmlVI.StringDisplayModeConstants.TextDisplayMode;
    const allowScrollbarToOverflow = (allow) => (allow ? 'auto' : 'hidden');
    const overflowToAllowScrollbar = (overflow) => (overflow !== 'hidden');
    const _scrollBarVisibilityEnum = Object.freeze({
        None: 0,
        Automatic: 1
    });
    class StringControlViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('acceptsReturn');
            this.registerAutoSyncProperty('typeToReplace');
            this.registerAutoSyncProperty('wordWrap');
        }
        static get scrollBarVisibilityEnum() {
            return _scrollBarVisibilityEnum;
        }
        bindToView() {
            super.bindToView();
            const that = this;
            that.bindFocusEventListener();
            that.element.addEventListener('text-changed', function (evt) {
                that.model.controlChanged(evt.detail.text);
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'text':
                    renderBuffer.properties.textNonSignaling = this.model.text;
                    break;
                case 'escapedDisplayMode':
                    renderBuffer.properties.escapedDisplayMode = this.model.escapedDisplayMode;
                    break;
                case 'textAlignment':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN] = this.model.textAlignment;
                    break;
                case 'allowHorizontalScrollbar':
                    renderBuffer.cssStyles[CSS_PROPERTIES.OVERFLOW_X] = allowScrollbarToOverflow(this.model.allowHorizontalScrollbar);
                    break;
                case 'allowVerticalScrollbar':
                    renderBuffer.cssStyles[CSS_PROPERTIES.OVERFLOW_Y] = allowScrollbarToOverflow(this.model.allowVerticalScrollbar);
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.text = this.element.text;
            this.model.defaultValue = this.element.text;
            this.model.escapedDisplayMode = this.element.escapedDisplayMode;
            const style = window.getComputedStyle(this.element);
            this.model.textAlignment = style.getPropertyValue(CSS_PROPERTIES.TEXT_ALIGN);
            this.model.allowHorizontalScrollbar = overflowToAllowScrollbar(style.getPropertyValue(CSS_PROPERTIES.OVERFLOW_X));
            this.model.allowVerticalScrollbar = overflowToAllowScrollbar(style.getPropertyValue(CSS_PROPERTIES.OVERFLOW_Y));
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.textNonSignaling = this.model.text;
            this.element.escapedDisplayMode = this.model.escapedDisplayMode;
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN, this.model.textAlignment);
            this.element.style.setProperty(CSS_PROPERTIES.OVERFLOW_X, allowScrollbarToOverflow(this.model.allowHorizontalScrollbar));
            this.element.style.setProperty(CSS_PROPERTIES.OVERFLOW_Y, allowScrollbarToOverflow(this.model.allowVerticalScrollbar));
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.text = gPropertyValue;
                    break;
                case StringControlModel.ENABLE_WRAP_G_PROPERTY_NAME:
                    model.wordWrap = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(gPropertyValue);
                    break;
                case StringControlModel.VERTICAL_SCROLLBAR_VISIBILITY_G_PROPERTY_NAME:
                    model.allowVerticalScrollbar = gPropertyValue === StringControlViewModel.scrollBarVisibilityEnum.Automatic;
                    break;
                case StringControlModel.HORIZONTAL_SCROLL_BAR_VISIBILITY_G_PROPERTY_NAME:
                    model.allowHorizontalScrollbar = gPropertyValue === StringControlViewModel.scrollBarVisibilityEnum.Automatic;
                    break;
                case StringControlModel.SELECT_ALL_ON_FOCUS_G_PROPERTY_NAME:
                    model.typeToReplace = gPropertyValue;
                    break;
                case StringControlModel.ESCAPE_SEQUENCE_G_PROPERTY_NAME:
                    model.escapedDisplayMode = gPropertyValue ? textDisplayMode.ESCAPED : textDisplayMode.DEFAULT;
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.text;
                case StringControlModel.ENABLE_WRAP_G_PROPERTY_NAME:
                    return model.wordWrap;
                case StringControlModel.VERTICAL_SCROLLBAR_VISIBILITY_G_PROPERTY_NAME:
                    return model.allowVerticalScrollbar ? StringControlViewModel.scrollBarVisibilityEnum.Automatic : StringControlViewModel.scrollBarVisibilityEnum.None;
                case StringControlModel.HORIZONTAL_SCROLL_BAR_VISIBILITY_G_PROPERTY_NAME:
                    return model.allowHorizontalScrollbar ? StringControlViewModel.scrollBarVisibilityEnum.Automatic : StringControlViewModel.scrollBarVisibilityEnum.None;
                case StringControlModel.SELECT_ALL_ON_FOCUS_G_PROPERTY_NAME:
                    return model.typeToReplace;
                case StringControlModel.ESCAPE_SEQUENCE_G_PROPERTY_NAME:
                    return model.escapedDisplayMode === textDisplayMode.ESCAPED;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(StringControlViewModel, NationalInstruments.HtmlVI.Elements.StringControl, NationalInstruments.HtmlVI.Models.StringControlModel, 'ni-string-control');
    NationalInstruments.HtmlVI.ViewModels.StringControlViewModel = StringControlViewModel;
})();
//# sourceMappingURL=niStringControlViewModel.js.map