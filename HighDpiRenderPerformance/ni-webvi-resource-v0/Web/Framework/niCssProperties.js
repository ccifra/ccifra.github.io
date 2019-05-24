'use strict';
//***************************************
// Standard CSS property names used for
// control styling and customization
// National Instruments Copyright 2018
//***************************************
class CssProperties {
    // All Controls
    static get BORDER_WIDTH() {
        return '--ni-border-width';
    }
    static get PADDING() {
        return '--ni-padding';
    }
    static get MARGIN() {
        return '--ni-margin';
    }
    static get MAX_WIDTH() {
        return '--ni-max-width';
    }
    // Text Alignment
    static get TEXT_ALIGN() {
        return '--ni-text-align';
    }
    static get TEXT_ALIGN_AS_FLEX() {
        return '--ni-text-align-as-flex';
    }
    // Overflow
    static get OVERFLOW_X() {
        return '--ni-overflow-x';
    }
    static get OVERFLOW_Y() {
        return '--ni-overflow-y';
    }
    // Colors
    static get FOREGROUND_COLOR() {
        return '--ni-foreground-color';
    }
    static get BORDER_COLOR() {
        return '--ni-border-color';
    }
    static get BORDER_GRADIENT() {
        return '--ni-border-gradient';
    }
    static get BACKGROUND() {
        return '--ni-background';
    }
    // Boolean Controls
    static get TRUE_FOREGROUND_COLOR() {
        return '--ni-true-foreground-color';
    }
    static get TRUE_BACKGROUND() {
        return '--ni-true-background';
    }
    static get CHECK_MARK_COLOR() {
        return '--ni-check-mark-color';
    }
    static get CONTENT_DISPLAY() {
        return '--ni-content-display';
    }
    static get FALSE_FOREGROUND_COLOR() {
        return '--ni-false-foreground-color';
    }
    static get FALSE_BACKGROUND() {
        return '--ni-false-background';
    }
    static get FALSE_CONTENT_DISPLAY() {
        return '--ni-false-content-display';
    }
    // Numerics
    static get FILL() {
        return '--ni-fill-background';
    }
    // Selectors
    static get SELECTED_BACKGROUND() {
        return '--ni-selected-background';
    }
    static get UNSELECTED_BACKGROUND() {
        return '--ni-unselected-background';
    }
    // Tab control
    static get MIN_HEIGHT() {
        return '--ni-min-height';
    }
    // Flex Layout
    static get FLEX_GROW() {
        return '--ni-flex-grow';
    }
}
NationalInstruments.HtmlVI.CssProperties = CssProperties;
//# sourceMappingURL=niCssProperties.js.map