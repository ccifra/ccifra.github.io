"use strict";
//****************************************
// Time Stamp Text Box View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    const DATETIME_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.JQXDateTimeValueConverter;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    // Static Private Functions
    const computeEditMode = function (viewModel) {
        return viewModel.computeReadOnlyForElement() ? 'full' : 'partial'; // 'full' prevents the click-select of individual date/time segments when an indicator, which isn't wanted
    };
    // Inheritance is different from C# view model (where time stamp is a numeric) so that min/max/value properties can have a different datatype
    class TimeStampTextBoxViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        static viewReady(element) {
            NationalInstruments.JQXElement.addHandlersForMouseWheel(element);
            // Workaround for bug where at edit-time you can only click-to-highlight a time field once, without clicking out
            // of then back into the control. Timing issue in-editor where focused event happens before click event, and in
            // the browser it's the other way around.
            if (NationalInstruments.HtmlVI.viReferenceService.getWebAppModelByVIRef(element.viRef).updateService.isInIdeMode()) {
                element.addEventListener('focus', function (evt) {
                    evt.stopPropagation();
                }, true);
            }
        }
        getReadOnlyPropertyName() {
            return 'readonly';
        }
        bindToView() {
            super.bindToView();
            const that = this;
            that.bindFocusEventListener();
            that.element.addEventListener('change', function (event) {
                if (event.target === that.element) {
                    const newValue = DATETIME_VAL_CONVERTER.convertBack(event.detail.value, that.element);
                    that.model.controlChanged(newValue);
                }
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'value':
                    renderBuffer.properties.value = DATETIME_VAL_CONVERTER.convert(this.model.value);
                    break;
                case 'minimum':
                    renderBuffer.properties.min = DATETIME_VAL_CONVERTER.convert(this.model.minimum);
                    break;
                case 'maximum':
                    renderBuffer.properties.max = DATETIME_VAL_CONVERTER.convert(this.model.maximum);
                    break;
                case 'showCalendarButton':
                    renderBuffer.properties.calendarButton = this.model.showCalendarButton;
                    break;
                case 'spinButtons':
                    renderBuffer.properties.spinButtons = this.model.spinButtons;
                    break;
                case 'formatString':
                    renderBuffer.attributes['format-string'] = this.model.formatString; // TA282253 - Using attribute instead of property due to JQX bug with handling slashes in values
                    break;
                case 'textAlignment':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN] = this.model.textAlignment;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.value = DATETIME_VAL_CONVERTER.convertBack(this.element.value, this.element);
            this.model.minimum = DATETIME_VAL_CONVERTER.convertBack(this.element.min, this.element);
            this.model.maximum = DATETIME_VAL_CONVERTER.convertBack(this.element.max, this.element);
            this.model.spinButtons = this.element.spinButtons;
            this.model.showCalendarButton = this.element.calendarButton;
            this.model.formatString = this.element.formatString;
            const style = window.getComputedStyle(this.element);
            this.model.textAlignment = style.getPropertyValue(CSS_PROPERTIES.TEXT_ALIGN);
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.value = DATETIME_VAL_CONVERTER.convert(this.model.value);
            this.element.min = DATETIME_VAL_CONVERTER.convert(this.model.minimum);
            this.element.max = DATETIME_VAL_CONVERTER.convert(this.model.maximum);
            this.element.spinButtons = this.model.spinButtons;
            this.element.setAttribute('format-string', this.model.formatString); // TA282253 - Using attribute instead of property due to JQX bug with handling slashes in values
            this.element.showCalendarButton = this.model.showCalendarButton;
            this.element.spinButtonsPosition = 'left';
            this.element.spinButtonsInitialDelay = 500;
            this.element.dropDownDisplayMode = 'classic';
            this.element.displayKind = 'local';
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN, this.model.textAlignment);
            this.element.editMode = computeEditMode(this);
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
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.value;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(TimeStampTextBoxViewModel, null, NationalInstruments.HtmlVI.Models.TimeStampTextBoxModel, 'jqx-date-time-picker');
    NationalInstruments.HtmlVI.ViewModels.TimeStampTextBoxViewModel = TimeStampTextBoxViewModel;
})();
//# sourceMappingURL=niTimeStampTextBoxViewModel.js.map