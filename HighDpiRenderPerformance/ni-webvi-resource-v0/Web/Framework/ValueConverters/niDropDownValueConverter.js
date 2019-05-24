'use strict';
class DropDownValueConverter {
    // Model -> Element
    static convert(selectedIndex) {
        let result = selectedIndex;
        if (!Array.isArray(selectedIndex)) {
            result = selectedIndex >= 0 ? [selectedIndex] : [];
        }
        else {
            result = selectedIndex;
        }
        return result;
    }
    // Element -> Model
    static convertBack(selectedIndex) {
        let result = selectedIndex;
        if (Array.isArray(selectedIndex)) {
            result = result.length > 0 ? result[0] : -1;
        }
        else {
            result = result >= 0 ? [result] : [];
        }
        return result;
    }
}
NationalInstruments.HtmlVI.ValueConverters.DropDownValueConverter = DropDownValueConverter;
//# sourceMappingURL=niDropDownValueConverter.js.map