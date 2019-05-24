"use strict";
//****************************************
// Radio Button Group Prototype
// DOM Registration: HTMLNIRadioButtonGroup
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const ORIENTATION_ENUM = {
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical'
    };
    // Static Private Variables
    // None
    // Static Private Functions
    const attachSingleRadioButton = function (target, displayValue, checked) {
        const radioButtonElement = document.createElement('jqx-radio-button');
        radioButtonElement.setAttribute('check-mode', 'both');
        if (target.readOnly) {
            radioButtonElement.setAttribute('readonly', '');
        }
        if (target.disabled) {
            radioButtonElement.setAttribute('disabled', '');
        }
        radioButtonElement.innerHTML = NI_SUPPORT.escapeHtml(displayValue);
        if (checked) {
            radioButtonElement.setAttribute('checked', '');
        }
        target.appendChild(radioButtonElement);
        return radioButtonElement;
    };
    const attachChildrenRadioButton = function (target) {
        // Remove all child controls
        target.innerHTML = '';
        target._childRadioButtons = [];
        const data = target.getSourceAndSelectedIndexFromSource();
        let i, curRadioButton, checked;
        for (i = 0; i < data.source.length; i++) {
            checked = data.selectedIndex === i;
            curRadioButton = attachSingleRadioButton(target, data.source[i], checked);
            target._childRadioButtons.push(curRadioButton);
        }
    };
    class RadioButtonGroup extends NationalInstruments.HtmlVI.Elements.NumericValueSelector {
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = RadioButtonGroup.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'orientation',
                defaultValue: ORIENTATION_ENUM.VERTICAL
            });
        }
        createdCallback() {
            super.createdCallback();
            const that = this;
            that._childRadioButtons = [];
            that.addEventListener('change', function (evt) {
                const selectedIndex = that._childRadioButtons.indexOf(evt.target);
                if (selectedIndex > -1) {
                    that.selectChangedHandler(that.itemsArray[selectedIndex].displayValue);
                }
                // Prevent internal JQX change events from bubbling up out of the control
                evt.stopImmediatePropagation();
            });
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            if (firstCall === true) {
                attachChildrenRadioButton(this);
            }
            return firstCall;
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            const that = this;
            switch (propertyName) {
                case 'items':
                    this.refreshItemsArray();
                    attachChildrenRadioButton(this);
                    break;
                case 'value': {
                    const data = this.getSourceAndSelectedIndexFromSource();
                    this._childRadioButtons[data.selectedIndex].checked = true;
                    break;
                }
                case 'readOnly':
                    this._childRadioButtons.forEach(function (radioButton) {
                        radioButton.readonly = that.readOnly;
                    });
                    break;
                case 'disabled':
                    this._childRadioButtons.forEach(function (radioButton) {
                        radioButton.disabled = that.disabled;
                    });
                    break;
            }
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(RadioButtonGroup);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(RadioButtonGroup.prototype, 'ni-radio-button-group', 'HTMLNIRadioButtonGroup');
    NationalInstruments.HtmlVI.Elements.RadioButtonGroup = RadioButtonGroup;
    NationalInstruments.HtmlVI.Elements.RadioButtonGroup.OrientationEnum = ORIENTATION_ENUM;
}());
//# sourceMappingURL=ni-radio-button-group.js.map