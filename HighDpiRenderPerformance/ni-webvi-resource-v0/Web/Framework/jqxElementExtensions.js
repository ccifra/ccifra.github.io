"use strict";
//****************************************
// Custom Element Extensions
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const NI_VIEW_MODELS = NationalInstruments.HtmlVI.ViewModels;
    const COMMON_MODULE = NationalInstruments.HtmlVI.JqxElementCommonModule;
    function createElementInformation(tagName, propertyName, eventName, attributeName) {
        if (attributeName == null) {
            attributeName = propertyName;
        }
        return {
            tagName,
            propertyName,
            attributeName,
            eventName
        };
    }
    const jqxNumericTextBox = createElementInformation('jqx-numeric-text-box', 'value', 'change');
    const jqxProgressBar = createElementInformation('jqx-progress-bar', 'value', ' ');
    const jqxCircularProgressBar = createElementInformation('jqx-circular-progress-bar', 'value', ' ');
    const jqxTank = createElementInformation('jqx-tank', 'value', 'change');
    const jqxSlider = createElementInformation('jqx-slider', 'value', 'change');
    const jqxGauge = createElementInformation('jqx-gauge', 'value', 'change');
    const jqxDateTimePicker = createElementInformation('jqx-date-time-picker', 'value', 'change');
    jqxDateTimePicker.viewReady = NI_VIEW_MODELS.TimeStampTextBoxViewModel.viewReady;
    const jqxToggleButton = createElementInformation('jqx-toggle-button', 'checked', 'change');
    const jqxSwitchButton = createElementInformation('jqx-switch-button', 'checked', 'change');
    const jqxPowerButton = createElementInformation('jqx-power-button', 'checked', 'change');
    const jqxLed = createElementInformation('jqx-led', 'checked', 'change');
    const jqxCheckBox = createElementInformation('jqx-check-box', 'checked', 'change');
    const jqxRadioButton = createElementInformation('jqx-radio-button'); // see jqx-element issue 201
    const jqxListBox = createElementInformation('jqx-list-box', 'selectedIndexes', 'change');
    const jqxDropDownList = createElementInformation('jqx-drop-down-list', 'selectedIndexes', 'change');
    const niCartesianAxis = createElementInformation('ni-cartesian-axis');
    const niColorScale = createElementInformation('ni-color-scale');
    const niCartesianPlot = createElementInformation('ni-cartesian-plot');
    const niCartesianPlotRenderer = createElementInformation('ni-cartesian-plot-renderer');
    const niCursor = createElementInformation('ni-cursor');
    const niCartesianGraph = createElementInformation('ni-cartesian-graph');
    const niChart = createElementInformation('ni-chart');
    const niIntensityGraph = createElementInformation('ni-intensity-graph');
    const niGraphTools = createElementInformation('ni-graph-tools');
    const niPlotLegend = createElementInformation('ni-plot-legend');
    const niScaleLegend = createElementInformation('ni-scale-legend');
    const niCursorLegend = createElementInformation('ni-cursor-legend');
    const niFlexibleLayoutComponent = createElementInformation('ni-flexible-layout-component');
    const niFlexibleLayoutContainer = createElementInformation('ni-flexible-layout-container');
    const niFlexibleLayoutGroup = createElementInformation('ni-flexible-layout-group');
    const niFlexibleLayoutWrapper = createElementInformation('ni-flexible-layout-wrapper');
    const niFrontPanel = createElementInformation('ni-front-panel');
    const niHyperLink = createElementInformation('ni-hyperlink', 'href', 'href-changed');
    const niTree = createElementInformation('ni-tree');
    // The list of jqx elements that we support along with their element info
    const allElements = [
        jqxNumericTextBox,
        jqxProgressBar,
        jqxCircularProgressBar,
        jqxTank,
        jqxSlider,
        jqxGauge,
        jqxDateTimePicker,
        jqxToggleButton,
        jqxSwitchButton,
        jqxPowerButton,
        jqxLed,
        jqxCheckBox,
        jqxRadioButton,
        jqxListBox,
        jqxDropDownList,
        niCartesianAxis,
        niColorScale,
        niCartesianPlot,
        niCartesianPlotRenderer,
        niCursor,
        niCartesianGraph,
        niChart,
        niIntensityGraph,
        niGraphTools,
        niPlotLegend,
        niScaleLegend,
        niCursorLegend,
        niFlexibleLayoutComponent,
        niFlexibleLayoutContainer,
        niFlexibleLayoutGroup,
        niFlexibleLayoutWrapper,
        niFrontPanel,
        niHyperLink,
        niTree
    ];
    function addProperties(proto, elementInfo) {
        proto.clearProperties = COMMON_MODULE.generateClearProperties();
        Object.defineProperty(proto, 'elementInfo', {
            configurable: false,
            enumerable: true,
            value: elementInfo,
            writable: true
        });
        /* Not all elements fall into the "control with one attribute" pattern. The property name, attributeName and eventName are optional.*/
        if (elementInfo.propertyName !== undefined) {
            NI_SUPPORT.setValuePropertyDescriptor(proto, elementInfo.attributeName, elementInfo.propertyName, elementInfo.propertyName, elementInfo.eventName);
        }
    }
    // Extensions to multiple prototypes
    let toReg;
    function handleRegistered(proto, elementInfo) {
        addProperties(proto, elementInfo);
        proto.addModule(COMMON_MODULE);
    }
    function whenRegistered(elementInfo) {
        window.JQX.Elements.whenRegistered(elementInfo.tagName, function (proto) {
            handleRegistered(proto, elementInfo);
        });
    }
    NationalInstruments.JQXElement.isJQXElementSubPart = function (element) {
        return element.niControlId === 'null' || element.niControlId === null;
    };
    NationalInstruments.JQXElement.addHandlersForMouseWheel = function (element) {
        // TA282243 : JQX enableMouseWheelAction takes effect even when the control isn't focused.
        // We should ask them to change the behavior or add a new property indicating that mouse
        // wheel actions will only take effect when the control is focused, which is what we want.
        element.addEventListener('focus', function (_evt) {
            element.enableMouseWheelAction = true;
        }, true);
        element.addEventListener('blur', function (_evt) {
            element.enableMouseWheelAction = false;
        }, true);
    };
    NationalInstruments.JQXElement._registerElements = function () {
        window.JQX.Elements.registerElements();
    };
    for (toReg in allElements) {
        if (allElements.hasOwnProperty(toReg)) {
            whenRegistered(allElements[toReg]);
        }
    }
})();
//# sourceMappingURL=jqxElementExtensions.js.map