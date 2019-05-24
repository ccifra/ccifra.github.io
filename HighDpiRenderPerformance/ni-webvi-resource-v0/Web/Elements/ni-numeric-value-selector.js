"use strict";
//****************************************
// Numeric Value Selector Prototype
// DOM Registration: No
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const JQX_NUM_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter;
    const NUM_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.NumericValueConverter;
    const NIType = window.NIType;
    const NITypeNames = window.NITypeNames;
    // Static Private Variables
    // None
    // Static Private Functions
    const getNumericNIType = function (element) {
        let niType = new NIType(element.niType);
        if (niType.isEnum()) {
            niType = niType.getSubtype();
        }
        return niType;
    };
    const selectorItemValueToNIElementNumericValue = function (itemValue, niType) {
        // Item value is a string
        // JQXNumericValueConverter.convertBack: Converts to JS model representation (number or string for Int64/UInt64)
        // NumericValueConverter.convert: number/string to {numberValue:123} (or {stringValue:'123'} for Int64/UInt64)
        return NUM_VAL_CONVERTER.convert(JQX_NUM_VAL_CONVERTER.convertBack(itemValue, niType), niType, true);
    };
    const niElementNumericValueToSelectorItemValue = function (elementValue, niType) {
        // NI Element numeric value format: {numberValue:123} (or {stringValue:'123'} for Int64/UInt64)
        // NumericValueConverter.convertBack: Converts back to JS model representation (number or string for Int64/UInt64)
        // JQXNumericValueConverter.convert: Converts to a string (item value format)
        return JQX_NUM_VAL_CONVERTER.convert(NUM_VAL_CONVERTER.convertBack(elementValue, niType), niType);
    };
    const itemValuesEqual = function (value1, value2, numericNIType) {
        if (numericNIType.is64BitInteger()) {
            return value1 === value2;
        }
        else {
            return parseFloat(value1) === parseFloat(value2);
        }
    };
    const resetUnselectableFromAllItems = function (dropdownElement) {
        const itemList = dropdownElement.items;
        if (itemList === undefined) {
            return;
        }
        for (let i = 0; i < itemList.length; i++) {
            if (itemList[i].unselectable) {
                itemList[i].unselectable = false;
            }
        }
    };
    class NumericValueSelector extends NationalInstruments.HtmlVI.Elements.Visual {
        // Public Prototype Methods
        createdCallback() {
            super.createdCallback();
            this.itemsArray = [];
            this.disabledIndexesArray = [];
            this._itemsUpdating = false;
            this._hasUndefinedValue = false;
        }
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = NumericValueSelector.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'disabledIndexes',
                defaultValue: '[]'
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'value',
                defaultValue: { stringValue: '0', numberValue: 0 },
                fireEvent: true,
                addNonSignalingProperty: true
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'niType',
                defaultValue: NITypeNames.INT32
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'items',
                defaultValue: '[]'
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'popupEnabled',
                defaultValue: false
            });
            NI_SUPPORT.setValuePropertyDescriptor(targetPrototype, 'value', 'value', 'valueNonSignaling', 'value-changed');
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            if (firstCall === true) {
                this.refreshItemsArray();
                this.refreshDisabledIndexesArray();
            }
            return firstCall;
        }
        refreshItemsArray() {
            this.itemsArray = JSON.parse(this.items);
        }
        refreshDisabledIndexesArray() {
            this.disabledIndexesArray = JSON.parse(this.disabledIndexes);
        }
        createSource() {
            const source = [];
            const itemsArray = this.itemsArray;
            let i;
            for (i = 0; i < itemsArray.length; i++) {
                source.push(itemsArray[i].displayValue);
            }
            return source;
        }
        findValue() {
            const itemsArray = this.itemsArray;
            let i;
            const niType = getNumericNIType(this);
            const value = niElementNumericValueToSelectorItemValue(this.value, niType);
            for (i = 0; i < itemsArray.length; i++) {
                if (itemValuesEqual(itemsArray[i].value, value, niType)) {
                    return i;
                }
            }
            return -1;
        }
        getSourceAndSelectedIndexFromSource() {
            const result = {};
            const source = [];
            let selectedIndex = -1;
            const niType = getNumericNIType(this);
            const numValue = niElementNumericValueToSelectorItemValue(this.value, niType);
            const itemsArray = this.itemsArray;
            for (let i = 0; i < itemsArray.length; i++) {
                const item = itemsArray[i];
                source.push(item.displayValue);
                if (itemValuesEqual(item.value, numValue, niType)) {
                    selectedIndex = i;
                }
            }
            result.source = source;
            result.selectedIndex = selectedIndex;
            return result;
        }
        // handler to update the property when the dropdown selection changed
        selectChangedHandler(selectValue) {
            const itemsArray = this.itemsArray;
            const niType = getNumericNIType(this);
            let numValue = -1;
            for (let i = 0; i < itemsArray.length; i++) {
                const item = itemsArray[i];
                if (item.displayValue === selectValue) {
                    numValue = item.value;
                    this.value = selectorItemValueToNIElementNumericValue(item.value, niType);
                    break;
                }
            }
            return numValue;
        }
        addUndefinedValue(dropdownElement) {
            const niType = getNumericNIType(this);
            const value = niElementNumericValueToSelectorItemValue(this.value, niType);
            const newItem = { value: value, displayValue: '<' + value + '>' };
            if (this._hasUndefinedValue) {
                this.itemsArray.pop();
                this._hasUndefinedValue = false;
            }
            this.itemsArray.push(newItem);
            const selectedIndex = this.itemsArray.length - 1;
            this._itemsUpdating = true;
            this.items = JSON.stringify(this.itemsArray);
            dropdownElement.dataSource = this.createSource();
            dropdownElement.selectedIndexes = [selectedIndex];
            this._hasUndefinedValue = true;
            this._itemsUpdating = false;
            return selectedIndex;
        }
        removeUndefinedValue(dropdownElement) {
            const itemsArray = this.itemsArray;
            if (itemsArray.length === 0) {
                return;
            }
            if (this._hasUndefinedValue) {
                this.itemsArray.pop();
                this._hasUndefinedValue = false;
            }
            this._itemsUpdating = true;
            this.items = JSON.stringify(this.itemsArray);
            const selectedIndex = this.findValue();
            dropdownElement.dataSource = this.createSource();
            dropdownElement.selectedIndexes = [selectedIndex];
            this._itemsUpdating = false;
        }
        setDisabledIndexes(dropdownElement) {
            resetUnselectableFromAllItems(dropdownElement);
            const itemList = dropdownElement.items;
            const disabledIndexes = this.disabledIndexesArray;
            for (let i = 0; i < disabledIndexes.length; i++) {
                if (disabledIndexes[i] < itemList.length &&
                    disabledIndexes[i] >= 0 &&
                    !itemList[disabledIndexes[i]].unselectable) {
                    itemList[disabledIndexes[i]].unselectable = true;
                }
            }
        }
        propertyUpdatedHelper(propertyName, dropdownElement, allowCreateNewSelectedItem) {
            let selectedIndex;
            switch (propertyName) {
                case 'items':
                    if (!this._itemsUpdating) {
                        this._itemsUpdating = true;
                        this.refreshItemsArray();
                        dropdownElement.dataSource = this.createSource();
                        selectedIndex = this.findValue();
                        selectedIndex = selectedIndex >= 0 && selectedIndex < this.itemsArray.length ? selectedIndex : 0;
                        dropdownElement.selectedIndexes = [selectedIndex];
                        const niType = getNumericNIType(this);
                        this.value = selectorItemValueToNIElementNumericValue(this.itemsArray[selectedIndex].value, niType);
                        this._itemsUpdating = false;
                        this.setDisabledIndexes(dropdownElement);
                    }
                    break;
                case 'disabledIndexes':
                    this.refreshDisabledIndexesArray();
                    this.setDisabledIndexes(dropdownElement);
                    break;
                case 'value':
                    if (allowCreateNewSelectedItem === false) {
                        selectedIndex = this.findValue();
                        dropdownElement.selectedIndexes = selectedIndex === -1 ? [0] : [selectedIndex];
                    }
                    else {
                        if (this.findValue() === -1) {
                            this.addUndefinedValue(dropdownElement);
                        }
                        else {
                            this.removeUndefinedValue(dropdownElement);
                        }
                        this.setDisabledIndexes(dropdownElement);
                    }
                    break;
                case 'readOnly':
                    dropdownElement.readonly = this.readOnly;
                    break;
                case 'disabled':
                    dropdownElement.disabled = this.disabled;
                    break;
                default:
                    break;
            }
        }
    }
    NationalInstruments.HtmlVI.Elements.NumericValueSelector = NumericValueSelector;
}());
//# sourceMappingURL=ni-numeric-value-selector.js.map