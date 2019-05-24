"use strict";
//****************************************
// DropDown View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const TEXTALIGN_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.TextAlignmentValueConverter;
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    class DropDownViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        convertToDropDownOpenMode(popupEnabled) {
            if (popupEnabled === false) {
                return 'none';
            }
            else {
                return 'default';
            }
        }
        getReadOnlyPropertyName() {
            return 'readonly';
        }
        bindToView() {
            super.bindToView();
            const that = this;
            that.enableResizeHack();
            that.element.addEventListener('selected-indexes-changed', function (evt) {
                if (that.model.readOnly === true) {
                    return;
                }
                const newValue = evt.detail.value;
                const selectedIndex = newValue.length > 0 ? newValue[0] : that.model.selectedIndex;
                if (that.model.selectedIndex === selectedIndex) {
                    return;
                }
                that.model.controlChanged(selectedIndex);
            });
        }
        modelPropertyChanged(propertyName) {
            const that = this;
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'popupEnabled':
                    renderBuffer.properties.dropDownOpenMode = this.convertToDropDownOpenMode(this.model.popupEnabled);
                    break;
                case 'selectedIndex':
                    renderBuffer.properties.selectedIndexes = this.model.selectedIndex === -1 ? [] : [this.model.selectedIndex];
                    break;
                case 'source': {
                    renderBuffer.properties.dataSource = this.model.source;
                    const selectedIndexes = this.model.selectedIndex === -1 ? [0] : [this.model.selectedIndex];
                    renderBuffer.postRender.source = function () {
                        that.element.selectedIndexes = selectedIndexes;
                    };
                    break;
                }
                case 'textAlignment':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN] = this.model.textAlignment;
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN_AS_FLEX] = TEXTALIGN_VAL_CONVERTER.convertTextAlignmentToFlexAlignment(this.model.textAlignment);
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.selectedIndex = this.element.selectedIndexes[0];
            this.model.defaultValue = this.element.selectedIndexes[0];
            this.model.popupEnabled = this.element.dropDownOpenMode !== 'none';
            this.model.textAlignment = window.getComputedStyle(this.element).getPropertyValue(CSS_PROPERTIES.TEXT_ALIGN);
            let source = this.element.dataSource;
            if (typeof source === 'string') {
                source = JSON.parse(source);
            }
            this.model.source = source;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.dataSource = this.model.source;
            this.element.selectedIndexes = this.model.selectedIndex === -1 ? [0] : [this.model.selectedIndex];
            this.element.dropDownOpenMode = this.convertToDropDownOpenMode(this.model.popupEnabled);
            this.element.dropDownHeight = 'auto';
            this.element.selectionMode = 'one';
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN, this.model.textAlignment);
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN_AS_FLEX, TEXTALIGN_VAL_CONVERTER.convertTextAlignmentToFlexAlignment(this.model.textAlignment));
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(DropDownViewModel, null, NationalInstruments.HtmlVI.Models.DropDownModel, 'jqx-drop-down-list');
    NationalInstruments.HtmlVI.ViewModels.DropDownViewModel = DropDownViewModel;
})();
//# sourceMappingURL=niDropDownViewModel.js.map