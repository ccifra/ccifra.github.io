"use strict";
//****************************************
// TextAlignment Value Convertor
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class TextAlignmentValueConverter {
        static convertTextAlignmentToFlexAlignment(textAlignment) {
            let justifyContent = "flex-start";
            switch (textAlignment) {
                case "center":
                    justifyContent = "center";
                    break;
                case "right":
                    justifyContent = "flex-end";
                    break;
                case "left":
                    justifyContent = "flex-start";
                    break;
            }
            return justifyContent;
        }
        static convertFlexAlignmentToTextAlignment(justifyContent) {
            let textAlignment = "left";
            switch (justifyContent) {
                case "center":
                    textAlignment = "center";
                    break;
                case "flex-end":
                    textAlignment = "right";
                    break;
                case "flex-start":
                    textAlignment = "left";
                    break;
            }
            return textAlignment;
        }
    }
    NationalInstruments.HtmlVI.ValueConverters.TextAlignmentValueConverter = TextAlignmentValueConverter;
}());
//# sourceMappingURL=niTextAlignmentValueConverter.js.map