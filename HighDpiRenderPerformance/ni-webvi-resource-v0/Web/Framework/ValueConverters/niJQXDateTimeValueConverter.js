"use strict";
(function () {
    'use strict';
    const fallbackVal = new JQX.Utilities.DateTime(new Date(-2082844800000)); // LV epoch
    class JQXDateTimeValueConverter {
        /**
         * Convert a date/ time value from Model to Element format.
         * @param {string} val - A date/ time string "seconds:fractionalSeconds"
         * @returns {Object} A JQX DateTime object
         */
        static convert(val) {
            const jsDate = new window.NITimestamp(val).toDate();
            if (isNaN(jsDate.getTime())) {
                // avoid an exception calling toISOString on dates that are outside the range of JS Date
                return new JQX.Utilities.DateTime(jsDate);
            }
            const jqxDate = new JQX.Utilities.DateTime(jsDate.toISOString(), 'UTC');
            return jqxDate;
        }
        /**
         * Convert a DateTime value from Element to Model format.
         * @param {Object} val - A JQX DateTime object, or a string representing a JQX DateTime
         * @param {Object} element - a reference to the control element
         * @returns {string} A date/ time string "seconds:fractionalSeconds"
         */
        static convertBack(val, element) {
            if (typeof val === 'string') {
                // jqxdatetimepicker._validateInitialPropertyValues happens after applyModelToElement, so we can get
                // string values that haven't been turned into the corresponding JQX.Utilities.DateTime objects yet
                val = JQX.Utilities.DateTime.validateDate(val, fallbackVal);
            }
            return new window.NITimestamp(new Date(val.toTimeZone('UTC').toString('yyyy-MM-ddTHH:mm:ss.fff') + 'Z')).toString();
        }
    }
    NationalInstruments.HtmlVI.ValueConverters.JQXDateTimeValueConverter = JQXDateTimeValueConverter;
}());
//# sourceMappingURL=niJQXDateTimeValueConverter.js.map