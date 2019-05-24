'use strict';
class JsonValueConverter {
    // Model -> Element
    static convert(obj, params) {
        const convertedValue = JSON.stringify(obj);
        return convertedValue;
    }
    // Element -> Model
    static convertBack(value, params) {
        const convertedValue = JSON.parse(value);
        return convertedValue;
    }
}
NationalInstruments.HtmlVI.ValueConverters.JsonValueConverter = JsonValueConverter;
//# sourceMappingURL=niJsonValueConverter.js.map