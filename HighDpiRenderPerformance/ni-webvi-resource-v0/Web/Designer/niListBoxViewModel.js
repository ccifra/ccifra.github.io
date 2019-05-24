"use strict";
//****************************************
// ListBox View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const LISTBOX_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.ListBoxValueConverter;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    const ListBoxModel = NationalInstruments.HtmlVI.Models.ListBoxModel;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    // Private Static Functions
    const createSelectionPostRender = function (element, selectionMode, selectedIndexes) {
        return function () {
            element._niUpdatingSelection = true;
            element.selectionMode = selectionMode;
            element.selectedIndexes = selectedIndexes;
            element._niUpdatingSelection = false;
        };
    };
    const createSourcePostRender = function (element, source, selectedIndexes) {
        return function () {
            element._niUpdatingSelection = true;
            element.dataSource = source;
            element.selectedIndexes = selectedIndexes;
            element._niUpdatingSelection = false;
        };
    };
    class ListBoxViewModel extends NationalInstruments.HtmlVI.ViewModels.SelectorViewModel {
        getReadOnlyPropertyName() {
            return 'readonly';
        }
        bindToView() {
            super.bindToView();
            const that = this;
            that.enableResizeHack();
            that.element.addEventListener('change', function () {
                if (that.element._niUpdatingSelection || that.model.readOnly === true) {
                    return;
                }
                const newValue = LISTBOX_VAL_CONVERTER.convertBack(that.element.selectedIndexes, that.model.selectionMode);
                that.model.controlChanged(newValue);
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'selectionMode':
                case 'selectedIndexes':
                    {
                        const selectionMode = LISTBOX_VAL_CONVERTER.convertNIToJQXSelectionMode(this.model.selectionMode);
                        const selectedIndexes = LISTBOX_VAL_CONVERTER.convert(this.model.selectedIndexes, this.model.selectionMode);
                        renderBuffer.postRender.selection = createSelectionPostRender(this.element, selectionMode, selectedIndexes);
                    }
                    break;
                case 'niType':
                    renderBuffer.properties.niType = this.model.getNITypeString();
                    break;
                case 'source':
                    {
                        const selectedIndexes = LISTBOX_VAL_CONVERTER.convert(this.model.selectedIndexes, this.model.selectionMode);
                        renderBuffer.postRender.source = createSourcePostRender(this.element, this.model.source, selectedIndexes);
                    }
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.selectionMode = LISTBOX_VAL_CONVERTER.convertJQXToNISelectionMode(this.element.selectionMode);
            const selectedIndexes = LISTBOX_VAL_CONVERTER.convertBack(this.element.selectedIndexes, this.model.selectionMode);
            const niType = this.element.getAttribute('ni-type');
            this.model.niType = new window.NIType(niType);
            this.model.selectedIndexes = selectedIndexes;
            this.model.defaultValue = selectedIndexes;
            let source = this.element.dataSource;
            if (typeof source === 'string') {
                source = JSON.parse(source);
            }
            this.model.source = source;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.niType = this.model.getNITypeString();
            this.element.selectionMode = LISTBOX_VAL_CONVERTER.convertNIToJQXSelectionMode(this.model.selectionMode);
            this.element.selectedIndexes = LISTBOX_VAL_CONVERTER.convert(this.model.selectedIndexes, this.model.selectionMode);
            this.element.dataSource = this.model.source;
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.selectedIndexes = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(gPropertyValue);
                    break;
                case ListBoxModel.TOP_VISIBLE_ROW_G_PROPERTY_NAME:
                    {
                        const numberOfItemsInListBox = this.element.items.length;
                        if (gPropertyValue >= 0 && gPropertyValue < numberOfItemsInListBox) {
                            this.element.topVisibleIndex = gPropertyValue;
                        }
                        else {
                            throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_OUT_OF_RANGE', gPropertyName, numberOfItemsInListBox - 1));
                        }
                    }
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.selectedIndexes;
                case ListBoxModel.TOP_VISIBLE_ROW_G_PROPERTY_NAME:
                    return this.element.topVisibleIndex;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(ListBoxViewModel, null, NationalInstruments.HtmlVI.Models.ListBoxModel, 'jqx-list-box');
    NationalInstruments.HtmlVI.ViewModels.ListBoxViewModel = ListBoxViewModel;
})();
//# sourceMappingURL=niListBoxViewModel.js.map