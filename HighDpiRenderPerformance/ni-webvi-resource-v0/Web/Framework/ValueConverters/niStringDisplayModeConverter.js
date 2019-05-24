"use strict";
/**
 * String Display mode helper methods
 */
(function () {
    'use strict';
    /**
     * This converter file is based on desktop version
     * Link: https://ni.visualstudio.com/DevCentral/_git/ASW?path=%2FSource%2FControls%2FControls.MocControls%2FTextDisplayMode.cs&version=GBmaster&line=230&lineEnd=231&lineStartColumn=1&lineEndColumn=1&lineStyle=plain&_a=contents
     */
    const defaultToEscapedMappings = {
        '\\': '\\\\',
        '\u0008': '\\b',
        '\u000c': '\\f',
        '\u000a': '\\n',
        '\u000d': '\\r',
        '\u0009': '\\t',
        '\u0020': '\\s'
    };
    const escapedToDefaultMappings = {
        'b': '\u0008',
        'f': '\u000c',
        'n': '\u000a',
        'r': '\u000d',
        't': '\u0009',
        's': '\u0020',
        '\\': '\\'
    };
    const hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    const isSpecialCharInDefaultMode = function (Char) {
        return defaultToEscapedMappings.hasOwnProperty(Char);
    };
    const isHexDigit = function (Char) {
        return hexDigits.includes(Char);
    };
    const isSpecialCharInEscapedMode = function (Char) {
        return escapedToDefaultMappings.hasOwnProperty(Char);
    };
    const convertHexToChar = function (value) {
        const decimalValue = parseInt(value, 16);
        if (decimalValue < 128) {
            return (String.fromCharCode(decimalValue));
        }
        return '?';
    };
    const getValidHexLength = function (index, string) {
        let validHexLength = 0;
        if ((index + 1) < string.length && isHexDigit(string[index + 1])) {
            validHexLength++;
            if ((index + 2) < string.length && isHexDigit(string[index + 2])) {
                validHexLength++;
            }
        }
        return validHexLength;
    };
    class StringDisplayModeConverter {
        static toDefaultDisplayMode(string) {
            let convertedString = "";
            let currentIndex = 0;
            let intermediateString = "";
            while (currentIndex < string.length) {
                if (string[currentIndex] === '\\' && currentIndex + 1 < string.length) {
                    if (isSpecialCharInEscapedMode(string[currentIndex + 1])) {
                        intermediateString = escapedToDefaultMappings[string[currentIndex + 1]];
                        currentIndex += 2;
                    }
                    else {
                        const ValidHexLength = getValidHexLength(currentIndex, string);
                        if (ValidHexLength === 0) {
                            // When Text is : "\"
                            intermediateString = string[currentIndex];
                            currentIndex++;
                        }
                        else if (ValidHexLength === 1) {
                            // When Text is : "\7" or "\8SomeOtherChar"
                            const hexChars = string[currentIndex + 1];
                            intermediateString = convertHexToChar(hexChars);
                            currentIndex += 2;
                        }
                        else if (ValidHexLength === 2) {
                            // When Text is : "\7f" or "\3DSomeOtherChar"
                            const hexChars = string[currentIndex + 1] + string[currentIndex + 2];
                            intermediateString = convertHexToChar(hexChars);
                            currentIndex += 3;
                        }
                    }
                }
                else {
                    intermediateString = string[currentIndex];
                    currentIndex++;
                }
                convertedString = convertedString.concat(intermediateString);
            }
            return convertedString;
        }
        static toEscapedDisplayMode(stringContent) {
            let convertedString = "";
            for (const char of stringContent) {
                const unicodeChar = char.charCodeAt(0);
                if (isSpecialCharInDefaultMode(char)) {
                    // Ex: "\s" => "\\s"
                    convertedString = convertedString + defaultToEscapedMappings[char];
                }
                else if (unicodeChar < 16) {
                    // Ex: "\u0001" => "\\01"
                    convertedString = convertedString + "\\0" + unicodeChar.toString(16);
                }
                else if (unicodeChar < 32 || unicodeChar === 127) {
                    // Ex: "\u001f" => "\\1f"
                    convertedString = convertedString + "\\" + unicodeChar.toString(16);
                }
                else {
                    convertedString = convertedString + char;
                }
            }
            return convertedString;
        }
    }
    NationalInstruments.HtmlVI.ValueConverters.StringDisplayModeConverter = StringDisplayModeConverter;
}());
//# sourceMappingURL=niStringDisplayModeConverter.js.map