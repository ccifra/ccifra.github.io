"use strict";
//****************************************
// Time Stamp Text Box Model
// Note that all values are expeced in LV time units
// (currently a number storing seconds since 1904, eventually also a number storing fractional seconds)
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NITypes = window.NITypes;
    const MIN_TIME = '-9223372036854775808:0'; // -9223372036854775808 is the smallest value that can be represented on int64
    const MAX_TIME = '9223372036854775807:0'; // -9223372036854775807 is the biggest value that can be represented on int64
    const NI_TYPE_PROPERTIES = {
        'value': true,
        'minimum': true,
        'maximum': true
    };
    // Inheritance is different from C# model (where time stamp is a numeric) so that min/max/value properties can have a different datatype.
    class TimeStampTextBoxModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this.niType = NITypes.TIMESTAMP;
            this._minimum = MIN_TIME;
            this._maximum = MAX_TIME;
            this._value = '0:0';
            this._formatString = 'MM/dd/yyyy hh:mm:ss.fff tt';
            this._showCalendarButton = false;
            this._spinButtons = false;
            this._textAlignment = 'left';
        }
        static get MODEL_KIND() {
            return 'niTimeStampTextBox';
        }
        get minimum() {
            return this._minimum;
        }
        set minimum(value) {
            this._minimum = value;
            this.notifyModelPropertyChanged('minimum');
        }
        get maximum() {
            return this._maximum;
        }
        set maximum(value) {
            this._maximum = value;
            this.notifyModelPropertyChanged('maximum');
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
            this.notifyModelPropertyChanged('value');
        }
        get formatString() {
            return this._formatString;
        }
        set formatString(value) {
            this._formatString = value;
            this.notifyModelPropertyChanged('formatString');
        }
        get showCalendarButton() {
            return this._showCalendarButton;
        }
        set showCalendarButton(value) {
            this._showCalendarButton = value;
            this.notifyModelPropertyChanged('showCalendarButton');
        }
        get spinButtons() {
            return this._spinButtons;
        }
        set spinButtons(value) {
            this._spinButtons = value;
            this.notifyModelPropertyChanged('spinButtons');
        }
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
        modelPropertyUsesNIType(propertyName) {
            return NI_TYPE_PROPERTIES[propertyName] === true;
        }
        controlChanged(newValue) {
            const oldValue = this.value;
            this.value = newValue;
            super.controlChanged('value', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.TimeStampTextBoxModel = TimeStampTextBoxModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.TimeStampTextBoxModel);
}());
//# sourceMappingURL=niTimeStampTextBoxModel.js.map