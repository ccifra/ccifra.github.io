"use strict";
//**************************************
// ArrayViewer Control Prototype
// DOM Registration: No
// National Instruments Copyright 2014
//**************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const $ = NationalInstruments.Globals.jQuery;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const NI_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.ElementValueConverter;
    const NIType = window.NIType;
    const DEEP_COPY_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.DeepCopyValueConverter;
    // Static Private Variables
    const THEME_NAME = 'ni-rethemed'; // Override 'legacy' theme because this control was rethemed by NI in niControlStyles CSS
    const ELEMENT_CHANGE_SYMBOL = Symbol('niArrayElementChange');
    // Static Private Functions
    // Gets a CSS selector for an NI visual. Note: The selector will only represent this element, it won't
    // walk up the DOM hierarchy. To get a complete selector (that can represent a control in an array in a cluster
    // in an array, for example), use getFullCssSelectorForNIVisual.
    const getCssSelectorForNIVisual = function (element, isInArrayTemplate, isLastElement) {
        let selector = element.tagName;
        const parent = element.parentElement;
        let i, n, curNode;
        if (parent instanceof NationalInstruments.HtmlVI.Elements.Cluster) {
            n = 1;
            for (i = 0; i < parent.childNodes.length; i++) {
                curNode = parent.childNodes[i];
                if (curNode === element) {
                    break;
                }
                else if (curNode.tagName === element.tagName) {
                    n++;
                }
            }
            selector = selector + ':nth-of-type(' + n + ')';
        }
        if (!isInArrayTemplate && element.niControlId !== undefined) {
            selector = selector + '[ni-control-id=\'' + element.niControlId + '\']';
        }
        if (element instanceof NationalInstruments.HtmlVI.Elements.ArrayViewer && isLastElement !== true) {
            if (isInArrayTemplate) {
                selector = selector + ' > div > div > div > div > table > tbody > tr > td > div.jqx-array-element';
            }
            else {
                selector = selector + ' div.jqx-array-element-' + element.childElement.id;
            }
        }
        return selector;
    };
    // Gets a full CSS selector for an NI Visual inside an array.
    // Note: The input arrayViewer should be the outermost / root one, for array-in-array
    // scenarios.
    const getFullCssSelectorForNIVisual = function (arrayViewer, targetElement) {
        const targetAndDescendants = [];
        let curNode = targetElement;
        let selector;
        while (curNode !== arrayViewer && curNode !== null) {
            targetAndDescendants.push(curNode);
            curNode = curNode.parentElement;
        }
        if (curNode === null) {
            return null;
        }
        selector = getCssSelectorForNIVisual(arrayViewer, false, targetAndDescendants.length === 0);
        while (targetAndDescendants.length > 0) {
            curNode = targetAndDescendants.pop();
            selector = selector.concat(' > ', getCssSelectorForNIVisual(curNode, true, targetAndDescendants.length === 0));
        }
        return selector;
    };
    const setArrayValue = function (arrayViewer, val, userUpdate) {
        if (arrayViewer._settingArrayValue === true || arrayViewer._clearingArrayValue === true || arrayViewer._creatingArrayValue === true) {
            return;
        }
        arrayViewer._settingArrayValue = true;
        // When array becomes type=none, code gets triggered to set the value to null. But ni-array-viewer defaults to [] instead,
        // so we use that. The jqxArray has some issues if it has a type set but a value of null (possible because when we reinitialize
        // it, if _arrayValue=null then, we'd change the jqxArray value to null too)
        arrayViewer._arrayValue = val !== null ? val : [];
        let oldValue;
        if (userUpdate) {
            if (arrayViewer._oldArrayValue === undefined) {
                throw new Error('Expected _oldArrayValue to already be set when responding to user update to array');
            }
            oldValue = arrayViewer._oldArrayValue;
            arrayViewer._oldArrayValue = undefined;
            arrayViewer.dispatchEvent(new CustomEvent('value-changed', {
                bubbles: true,
                cancelable: false,
                detail: {
                    newValue: val,
                    oldValue: oldValue
                }
            }));
        }
        else if (arrayViewer._jqxArrayInitialized) {
            arrayViewer.jqref.jqxArray({ value: arrayViewer._arrayValue });
        }
        arrayViewer._settingArrayValue = false;
    };
    const parseInitialValue = function (attributeValue) {
        let result = [], parsedVal;
        if (attributeValue !== null) {
            try {
                parsedVal = JSON.parse(attributeValue);
                if (Array.isArray(parsedVal)) {
                    result = parsedVal;
                }
            }
            catch (e) {
                // If the attribute valid is invalid, we don't want to throw, just fallback to a default
            }
        }
        return result;
    };
    const startObserving = function (target, listenSubtree) {
        const observer = target.mutationObserver;
        if (observer !== null && observer.observe !== undefined) {
            observer.observe(target, { childList: true, attributes: false, subtree: listenSubtree });
        }
    };
    const stopObserving = function (target) {
        if (target.mutationObserver !== null) {
            if (typeof target.mutationObserver.disconnect === 'function') {
                target.mutationObserver.disconnect();
            }
        }
    };
    const computeExpectedChildren = function (niType) {
        let expectedChildren = 0;
        let subtype = niType.getSubtype();
        let subtypes = [];
        if (subtype.isVoid() === false) {
            subtypes.push(subtype);
            while (subtypes.length > 0) {
                subtype = subtypes.shift();
                if (subtype.isCluster() || subtype.isArray()) {
                    subtypes = subtypes.concat(subtype.getSubtype());
                }
                expectedChildren += 1;
            }
        }
        return expectedChildren;
    };
    const getArrayElementNode = function (nodes) {
        let i = 0;
        for (i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (isExpectedNode(node)) {
                return node;
            }
        }
        return null;
    };
    const isExpectedNode = function (node) {
        return NI_SUPPORT.isElement(node) && node.niControlId !== null && node.tagName !== 'NI-LABEL';
    };
    const initializeMutationObserver = function (target) {
        const that = target;
        const expectedAddedChildren = 0;
        let addedChildrenCount = 0, rafId = 0, i = 0, shouldClearArray = false, templateNode = null;
        that.mutationObserver = new window.MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                if (m.type === 'childList') {
                    if (m.target === that) {
                        if (m.addedNodes.length > 0) {
                            const arrayElementNode = getArrayElementNode(m.addedNodes);
                            if (arrayElementNode !== null) {
                                templateNode = m.addedNodes[0];
                            }
                        }
                        else if (m.removedNodes.length > 0) {
                            const arrayElementNode = getArrayElementNode(m.removedNodes);
                            if (arrayElementNode !== null) {
                                templateNode = null;
                                shouldClearArray = true;
                            }
                        }
                        target._expectedChildrenCount = computeExpectedChildren(that._niTypeInstance);
                    }
                    for (i = 0; i < m.addedNodes.length; i += 1) {
                        const addedNode = m.addedNodes[i];
                        if (isExpectedNode(addedNode)) {
                            addedChildrenCount += 1;
                        }
                    }
                    for (i = 0; i < m.removedNodes.length; i += 1) {
                        const removedNode = m.removedNodes[i];
                        if (isExpectedNode(removedNode)) {
                            addedChildrenCount -= 1;
                        }
                    }
                }
            });
            if ((that.templateControl !== templateNode || addedChildrenCount === expectedAddedChildren) && rafId === 0) {
                // Is possible that some elements are still not there, so we'll give them a little bit more time.
                rafId = window.requestAnimationFrame(function () {
                    if (shouldClearArray) {
                        // If a 'Remove Control' message and an 'Add Control' message were both batched into this same
                        // call, we should still clear the jqxArray before reinitializing it. The jqxArray has code that
                        // doesn't trigger a full refresh if the array's type is the same (e.g. 'custom' and 'custom', which
                        // is always what we set when initializing the array). So we clear it so it becomes type = 'none',
                        // and the next initialization will trigger a full refresh which is what we want.
                        that.clearArrayType(true);
                    }
                    if (templateNode !== null) {
                        that.createArray(templateNode);
                    }
                    rafId = 0;
                    shouldClearArray = false;
                });
            }
        });
    };
    const getComputedNodeBoundsCss = function (node) {
        const selectBoundsFilter = ({ left, top, width, height }) => ({ left, top, width, height });
        return selectBoundsFilter(window.getComputedStyle(node));
    };
    class ArrayViewer extends NationalInstruments.HtmlVI.Elements.Visual {
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = ArrayViewer.prototype;
            Object.defineProperty(proto, 'value', {
                get: function () {
                    // it should deep copy to prevent internal state from being coupled externally
                    return DEEP_COPY_CONVERTER.deepCopy(this._arrayValue);
                },
                set: function (val) {
                    setArrayValue(this, val, true);
                },
                configurable: false,
                enumerable: true
            });
            Object.defineProperty(proto, 'valueNonSignaling', {
                get: function () {
                    return DEEP_COPY_CONVERTER.deepCopy(this._arrayValue);
                },
                set: function (val) {
                    setArrayValue(this, val, false);
                },
                configurable: false,
                enumerable: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'niType',
                defaultValue: '{"name":"Array","rank":1,"subtype":"Void"}'
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'dimensions',
                defaultValue: 1
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'orientation',
                defaultValue: 'horizontal'
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'indexEditorWidth',
                defaultValue: 53
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'indexVisibility',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'verticalScrollbarVisibility',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'horizontalScrollbarVisibility',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'focusedCell',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'rowsAndColumns',
                defaultValue: '1,1'
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'isEmpty',
                defaultValue: false
            });
            NI_SUPPORT.setValuePropertyDescriptor(targetPrototype, 'value', 'value', 'valueNonSignaling', 'value-changed');
        }
        getFullCssSelectorForNIVisual(targetElement) {
            return getFullCssSelectorForNIVisual(this, targetElement);
        }
        arrayElementSizeChanged(elementSize) {
            let i, niControl;
            const width = elementSize.width;
            const height = elementSize.height;
            if (width === this._elementWidth && height === this._elementHeight) {
                return;
            }
            this._elementWidth = width;
            this._elementHeight = height;
            const cssWidth = width + 'px';
            const cssHeight = height + 'px';
            if (this.templateControl !== null) {
                this.nodeCss[this.templateControl.niControlId].width = cssWidth;
                this.nodeCss[this.templateControl.niControlId].height = cssHeight;
            }
            this.jqref.jqxArray('resizeElement', width, height);
            const controls = document.querySelectorAll(getCssSelectorForNIVisual(this, false));
            for (i = 0; i < controls.length; i++) {
                niControl = controls[i].firstElementChild;
                niControl.style.width = cssWidth;
                niControl.style.height = cssHeight;
                if (niControl.forceResize !== undefined) {
                    niControl.forceResize({
                        width: width,
                        height: height
                    });
                }
            }
        }
        createdCallback() {
            const that = this;
            super.createdCallback();
            // Public Instance Properties
            this.childElement = null;
            this.jqref = null;
            this.nodeCss = {};
            this.templateControl = null;
            this.mutationObserver = null;
            this.attributeMutationObserver = null;
            Object.defineProperty(this, 'elementSize', {
                configurable: false,
                enumerable: true,
                get: function () {
                    return { width: this._elementWidth, height: this._elementHeight };
                },
                set: function (value) {
                    that.arrayElementSizeChanged(value);
                }
            });
            this.rows = 1;
            this.columns = 1;
            // Private Instance Properties
            this._userUpdate = false;
            this._settingArrayValue = false;
            this._useAttributeMutationObserver = true;
            this._elementWidth = 0;
            this._elementHeight = 0;
            this._nodeLabelMap = [];
            this._clearingArrayValue = false;
            this._creatingArrayValue = false;
            this._settingElementValue = false;
            this._arrayValue = [];
            this._niTypeInstance = undefined;
            this._oldArrayValue = undefined; // Used for temporarily saving a copy of the array for firing change events
        }
        connectedCallback() {
            // Private Instance Properties
            this._arrayValue = parseInitialValue(this.getAttribute('value'));
            super.connectedCallback(); // Call the base implementation after having set any properties that are expected to be synced to the model.
        }
        clearArrayType(wasInitialized) {
            stopObserving(this);
            this.templateControl = null;
            this._clearingArrayValue = true;
            const clearArraySettings = {
                type: 'none',
                dimensions: this.dimensions,
                indexerWidth: this.indexEditorWidth,
                showIndexDisplay: this.indexVisibility,
                showHorizontalScrollbar: this.horizontalScrollbarVisibility,
                showVerticalScrollbar: this.verticalScrollbarVisibility,
                disabled: this.disabled,
                theme: THEME_NAME
            };
            if (wasInitialized) {
                // We'll set size separately (the editor computes it, and it'll come here via forceResize)
                this.jqref.jqxArray(clearArraySettings);
            }
            else {
                clearArraySettings.width = this.style.width;
                clearArraySettings.height = this.style.height;
                this.jqref.jqxArray(clearArraySettings);
                this.updateIndexerTheme();
            }
            this._jqxArrayInitialized = true;
            this.isEmpty = true;
            this._clearingArrayValue = false;
            startObserving(this, true);
        }
        forceResize(size) {
            super.forceResize(size);
            if (this.templateControl === null) {
                this.jqref.jqxArray({
                    width: size.width + 'px',
                    height: size.height + 'px'
                });
            }
            this.style.height = size.height + 'px';
            this.style.width = size.width + 'px';
            // Occasionally array scrollbar thumb size ends up too wide (overflowing control) after a resize,
            // so tell scrollbars to re-render.
            this.jqref.find('div.jqx-array-scrollbar-horizontal, div.jqx-array-scrollbar-vertical').jqxScrollBar('refresh');
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            if (firstCall) {
                let node = null, i;
                const that = this;
                this.parseRowsAndColumns();
                for (i = 0; i < this.childNodes.length; i++) {
                    if (this.childNodes[i] instanceof HTMLElement && this.childNodes[i].tagName !== 'NI-LABEL') {
                        node = this.childNodes[i];
                        break;
                    }
                }
                this.childElement = document.createElement('div');
                this.appendChild(this.childElement);
                this.jqref = $(this.childElement);
                this._niTypeInstance = new NIType(this.niType);
                this._expectedChildrenCount = computeExpectedChildren(this._niTypeInstance);
                initializeMutationObserver(this);
                if (node !== null) {
                    // Delay initialization until all elements are registered and attached. Even if the template
                    // element is ready, a descendant might not be (e.g. if the template is a cluster and it contains
                    // another control).
                    NationalInstruments.HtmlVI.Elements.NIElement.addNIEventListener('attached', function () {
                        that.createArray(node);
                    });
                }
                else {
                    this.clearArrayType(false);
                }
                this.jqref.on('change', function (e) {
                    if (e.target === that.childElement && (e.detail === undefined || e.detail.changeType !== 'api')) {
                        that.value = that.jqref.val();
                    }
                });
                this.jqref.on('scroll', function () {
                    const indices = that.jqref.jqxArray('getIndexerValue');
                    const eventConfig = {
                        bubbles: true,
                        cancelable: true,
                        detail: {
                            indices: indices,
                            originalSource: this.childElement
                        }
                    };
                    that.dispatchEvent(new CustomEvent('scroll-changed', eventConfig));
                });
            }
            return firstCall;
        }
        detachedCallback() {
            super.detachedCallback();
            stopObserving(this);
            this.mutationObserver = null;
            this.templateControl = null;
        }
        updateFromTemplate(control, node, updatePosition) {
            control.niControlId = NI_SUPPORT.uniqueId();
            control._preventModelCreation = true;
            control.visible = true;
            let nodeCss = this.nodeCss[node.niControlId];
            if (nodeCss === undefined) {
                nodeCss = getComputedNodeBoundsCss(node);
                this.nodeCss[node.niControlId] = nodeCss;
            }
            control.style.width = nodeCss.width;
            control.style.height = nodeCss.height;
            control.style.display = '';
            if (updatePosition) {
                control.style.left = nodeCss.left;
                control.style.top = nodeCss.top;
            }
            else {
                control.style.left = '';
                control.style.top = '';
            }
            let i, j = 0;
            for (i = 0; i < node.childNodes.length; i++) {
                if (NI_SUPPORT.isElement(node.childNodes[i]) && control.childNodes[j] !== undefined) {
                    this.updateFromTemplate(control.childNodes[j], node.childNodes[i], true);
                    if (node.childNodes[i].tagName === 'NI-LABEL') {
                        this._nodeLabelMap[node.childNodes[i].niControlId] = control.childNodes[j].niControlId;
                    }
                    j++;
                }
            }
        }
        updateLabelIds(node) {
            let i, label;
            if (!NI_SUPPORT.isElement(node)) {
                return null;
            }
            for (i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].tagName !== 'NI-LABEL') {
                    label = this._nodeLabelMap[node.childNodes[i].labelId];
                    if (label === undefined) {
                        label = '';
                    }
                    node.childNodes[i].labelId = label;
                    this.updateLabelIds(node.childNodes[i]);
                }
            }
        }
        copyNIElement(node) {
            if (!NI_SUPPORT.isElement(node) || NationalInstruments.JQXElement.isJQXElementSubPart(node)) {
                return null;
            }
            const newNode = NI_SUPPORT.cloneControlElement(node);
            // niTemplate should always be a 'real' / original niControlId (a number). This allows us to look up
            // the real / original template control from all of our copies (for array elements and nested arrays).
            const nodeTemplateId = NI_SUPPORT.getTemplateId(node);
            if (nodeTemplateId !== undefined) {
                NI_SUPPORT.setTemplateId(newNode, nodeTemplateId);
            }
            else {
                NI_SUPPORT.setTemplateId(newNode, node.niControlId);
            }
            if (node.childNodes.length > 0) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const childNode = this.copyNIElement(node.childNodes[i]);
                    if (childNode !== null) {
                        newNode.appendChild(childNode);
                    }
                }
            }
            return newNode;
        }
        updateTemplateCss(templateDescendant) {
            this.nodeCss[templateDescendant.niControlId] = getComputedNodeBoundsCss(templateDescendant);
        }
        recreateCells(fullRefresh) {
            let r, c, cell;
            const that = this;
            if (that.templateControl === null || that.templateControl === undefined) {
                return;
            }
            const recreateCell = function (r, c) {
                let val, cellSelector;
                cell = that.jqref.jqxArray('getElement', r, c);
                if (cell !== null && cell !== undefined) {
                    cellSelector = $(cell);
                    val = that.jqref.jqxArray('getElementValue', cellSelector, { x: c, y: r });
                    while (cell.hasChildNodes()) {
                        cell.removeChild(cell.lastChild);
                    }
                    that.jqref.jqxArray('elementTemplate', cellSelector);
                    that.jqref.jqxArray('setElementValue', val, cellSelector, { x: c, y: r });
                }
            };
            if (fullRefresh) {
                for (r = 0; r < this.rows; r++) {
                    for (c = 0; c < this.columns; c++) {
                        recreateCell(r, c);
                    }
                }
            }
            else if (this._focusedColumn !== undefined && this._focusedRow !== undefined) {
                recreateCell(this._focusedRow, this._focusedColumn);
            }
            window.requestAnimationFrame(function () {
                that.updateFocusedCell();
            });
        }
        setDefaultValue(modelValue) {
            this.jqref.jqxArray('setDefaultValue', modelValue);
        }
        createArray(node) {
            const that = this;
            stopObserving(this);
            this._creatingArrayValue = true;
            const propertyName = node.valuePropertyDescriptor.propertyName;
            const eventName = node.valuePropertyDescriptor.eventName;
            const nonSignalingPropertyName = node.valuePropertyDescriptor.propertyNameNonSignaling;
            let defaultValue = node[propertyName];
            node.classList.add('array-template');
            node.style.left = '0px';
            node.style.top = '0px';
            node.style.display = 'none';
            node.labelId = '';
            this.templateControl = node;
            if (defaultValue !== undefined) {
                defaultValue = NI_VAL_CONVERTER.convertBack(node, defaultValue);
            }
            this.nodeCss = {};
            const curNodeCss = getComputedNodeBoundsCss(node);
            this.nodeCss[node.niControlId] = curNodeCss;
            this._elementWidth = parseInt(curNodeCss.width);
            this._elementHeight = parseInt(curNodeCss.height);
            this.jqref.jqxArray({
                elementWidth: this._elementWidth,
                elementHeight: this._elementHeight,
                elementTemplate: function (div) {
                    that._nodeLabelMap = [];
                    const control = that.copyNIElement(node);
                    $(control).removeClass('array-template');
                    const divElement = div[0];
                    const curNodeCss = that.nodeCss[node.niControlId];
                    that.updateFromTemplate(control, node, false);
                    that.updateLabelIds(control);
                    control.disabled = that.disabled;
                    divElement.style.width = curNodeCss.width;
                    divElement.style.height = curNodeCss.height;
                    div.on('change', function (event) {
                        // Some controls fire with an eventName of 'change', and 'change' events can also bubble up from JQX
                        // subparts inside controls we use. This can trigger the internal jqxArray change event incorrectly.
                        // The only time we want the jqxArray to get a 'change' event is when when we explicitly see a value change
                        // on the control that's a direct child of this div, and only if the value has truly changed (see notes below).
                        if (event.detail === undefined || event.detail[ELEMENT_CHANGE_SYMBOL] !== true) {
                            event.stopImmediatePropagation();
                        }
                    });
                    divElement.appendChild(control);
                    if (control.forceResize !== undefined) {
                        control.connectedCallback(); // Force internal DOM to be initialized, since the resize code often assumes its already there
                        control.forceResize({
                            width: that._elementWidth,
                            height: that._elementHeight
                        });
                    }
                    // Safeguard for when controls fire value change events when the value has actually not changed
                    // Known example is at edit time placing a horizontal slider in an array and changing the min value above default
                    const areDifferent = function (div) {
                        const data = $(div).data();
                        const x = data.col;
                        const y = data.row;
                        // Try to match the code path that jqxarray takes for checking value changes as closely as possible
                        const oldValue = that.jqref.jqxArray('_getValueInCell', y, x);
                        const newValue = that.jqref.jqxArray('_getElementValue', div, { x, y }, true);
                        const result = that.jqref.jqxArray('_areDifferent', newValue, oldValue);
                        return result;
                    };
                    $(control).on(eventName, function (event) {
                        if (!that._settingElementValue && event.detail !== undefined &&
                            event.detail.changeType !== 'api' && event.originalEvent.target === control) {
                            if (!div.supressChange) {
                                if (that._oldArrayValue !== undefined) {
                                    throw new Error('Expected _oldArrayValue to be undefined when starting a user change of the array');
                                }
                                if (that._settingArrayValue === false && that._clearingArrayValue === false && that._creatingArrayValue === false && areDifferent(div)) {
                                    that._oldArrayValue = DEEP_COPY_CONVERTER.deepCopy(that._arrayValue);
                                }
                                div.trigger($.Event('change', {
                                    detail: { [ELEMENT_CHANGE_SYMBOL]: true }
                                }));
                            }
                        }
                    });
                },
                changeProperty: function (property, value, widgets) {
                    if (property === 'width') {
                        widgets.css({ width: value });
                    }
                    else if (property === 'height') {
                        widgets.css({ height: value });
                    }
                    else if (property === 'disabled') {
                        widgets.css({ disabled: value });
                    }
                },
                getElementValue: function (div, dimensions) {
                    const element = div[0].firstElementChild;
                    const val = element[propertyName];
                    if (val !== undefined) {
                        try {
                            return NI_VAL_CONVERTER.convertBack(element, val);
                        }
                        catch (e) {
                            // Array can be in an intermediate bad state as we're changing the type of a template numeric control
                            return val;
                        }
                    }
                    return val;
                },
                setElementValue: function (value, div, dimensions) {
                    if (value !== undefined) {
                        const element = div[0].firstElementChild;
                        try {
                            that._settingElementValue = true;
                            element[nonSignalingPropertyName] = NI_VAL_CONVERTER.convert(element, value);
                            that._settingElementValue = false;
                        }
                        catch (e) {
                            // Array can be in an intermediate bad state as we're changing the type of a template numeric control
                        }
                    }
                },
                type: 'custom',
                dimensions: this.dimensions,
                indexerWidth: this.indexEditorWidth,
                showIndexDisplay: this.indexVisibility,
                customWidgetDefaultValue: defaultValue,
                showHorizontalScrollbar: this.horizontalScrollbarVisibility,
                showVerticalScrollbar: this.verticalScrollbarVisibility,
                disabled: this.disabled,
                theme: THEME_NAME,
                value: that._arrayValue
            });
            this._jqxArrayInitialized = true;
            // jqxArray hard codes a border of 2 pixels (1px left + 1px right)
            // internally in the _tdBorder calculation.
            // Because we remove element borders this causes the width to be too large
            // By subtracting the two pixel border the jqxArray instanced div fits inside the ni-array-viewer element
            $.data(this.childElement).jqxArray.instance._tdBorder -= 2;
            // TODO : We'd like to be able to send rows and columns in the same
            // jqxArray statement as above. However, this causes issues when you have
            // an initialized array (with > 1 rows or columns), delete the array element,
            // then undo (there's extra cells rendered that shouldn't be there).
            this.jqref.jqxArray({
                rows: this.rows,
                columns: this.columns
            });
            this.jqref.jqxArray({
                showHorizontalScrollbar: this.horizontalScrollbarVisibility,
                showVerticalScrollbar: this.verticalScrollbarVisibility
            });
            this.isEmpty = false;
            // Adding CSS class names
            this.jqref.addClass('ni-array-viewer-box');
            this.jqref.find(' .jqx-array-indexer').addClass('ni-indexer-box');
            this.jqref.find(' .jqx-input-content').addClass('ni-text-field');
            this.jqref.find(' .jqx-input.jqx-rc-r').addClass('ni-spins-box');
            this.jqref.find(' .jqx-action-button').addClass('ni-spin-button');
            this.jqref.find(' .jqx-icon-arrow-up').addClass('ni-increment-icon');
            this.jqref.find(' .jqx-icon-arrow-down').addClass('ni-decrement-icon');
            this.updateIndexerTheme();
            this.updateScrollbarTheme();
            this.updateFocusedCell();
            this._creatingArrayValue = false;
            startObserving(this, false);
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            switch (propertyName) {
                case 'dimensions':
                    if (this._jqxArrayInitialized) {
                        const settings = { dimensions: this.dimensions };
                        // When changing dimensions we need to re-push rows and cols (this was a fix for DE9104 - Array shows different
                        // # cells than adorners, when changing Dimensions from 1 -> 2 -> 1). Setting rows/ cols only makes sense for
                        // a non-empty array, however.
                        if (this.templateControl !== null) {
                            settings.rows = this.rows;
                            settings.columns = this.columns;
                        }
                        this.jqref.jqxArray(settings);
                        this.updateIndexerFont();
                        this.updateIndexerTheme();
                    }
                    break;
                case 'indexEditorWidth':
                    this.jqref.jqxArray({ indexerWidth: this.indexEditorWidth });
                    break;
                case 'indexVisibility':
                    this.jqref.jqxArray({ showIndexDisplay: this.indexVisibility });
                    break;
                case 'verticalScrollbarVisibility':
                    this.jqref.jqxArray({ showVerticalScrollbar: this.verticalScrollbarVisibility });
                    this.updateScrollbarTheme();
                    break;
                case 'horizontalScrollbarVisibility':
                    this.jqref.jqxArray({ showHorizontalScrollbar: this.horizontalScrollbarVisibility });
                    this.updateScrollbarTheme();
                    break;
                case 'focusedCell':
                    this.updateFocusedCell();
                    break;
                case 'rowsAndColumns':
                    this.updateRowsAndColumns();
                    break;
                case 'niType':
                    this._niTypeInstance = new NIType(this.niType);
                    this._expectedChildrenCount = computeExpectedChildren(this._niTypeInstance);
                    break;
                case 'disabled':
                    this.jqref.jqxArray({ disabled: this.disabled });
                    this.setDisabledOnChildElements(this.disabled);
                    this.setDisabledOnScrollBars(this.disabled);
                    break;
                default:
                    break;
            }
        }
        setDisabledOnChildElements(isDisabled) {
            const childElementSelector = this.getFullCssSelectorForNIVisual(this.templateControl);
            const childElements = document.querySelectorAll(childElementSelector);
            this.templateControl.disabled = this.disabled;
            childElements.forEach(childElement => {
                childElement.disabled = isDisabled;
            });
        }
        setDisabledOnScrollBars(isDisabled) {
            const elementsToDisable = this.querySelectorAll(' div.jqx-scrollbar');
            elementsToDisable.forEach(childElement => {
                $(childElement).jqxScrollBar({ disabled: isDisabled });
            });
        }
        updateFocusedCell() {
            let indices, i, curCell, matches, templateMatch, r, c;
            if (this.templateControl === null) {
                return;
            }
            if (typeof this.focusedCell === 'string' && this.focusedCell.length > 0) {
                indices = this.focusedCell.split(',');
                if (indices.length === 2) {
                    r = parseInt(indices[0]);
                    c = parseInt(indices[1]);
                    this._focusedRow = r;
                    this._focusedColumn = c;
                    curCell = this.jqref.jqxArray('getElement', r, c);
                    if (curCell === undefined || curCell === null) {
                        // We can get a focused cell index from C# that hasn't yet been created. In this case, we'll do the code below later
                        // (updateRowsAndColumns also triggers this)
                        return;
                    }
                    matches = curCell.querySelectorAll('[ni-control-id]');
                    for (i = 0; i < matches.length; i++) {
                        const niTemplateId = NI_SUPPORT.getTemplateId(matches[i]);
                        if (niTemplateId !== undefined) {
                            templateMatch = document.querySelector('[ni-control-id=\'' + niTemplateId + '\']');
                            if (templateMatch !== null) {
                                templateMatch._niFocusedCloneId = matches[i].niControlId;
                            }
                        }
                    }
                    return;
                }
            }
            this._focusedRow = undefined;
            this._focusedColumn = undefined;
            matches = Array.prototype.slice.call(this.templateControl.querySelectorAll('[ni-control-id]'));
            matches.push(this.templateControl);
            for (i = 0; i < matches.length; i++) {
                matches[i]._niFocusedCloneId = undefined;
            }
        }
        parseRowsAndColumns() {
            let indices;
            if (typeof this.rowsAndColumns === 'string' && this.rowsAndColumns.length > 0) {
                indices = this.rowsAndColumns.split(',');
                if (indices.length === 2) {
                    this.rows = parseInt(indices[0]);
                    this.columns = parseInt(indices[1]);
                }
            }
        }
        updateRowsAndColumns() {
            this.parseRowsAndColumns();
            // We can get a rows and columns update when we don't have an array element (if you undo the delete of an array element, there'll be separate
            // messages: first to put back the old rows and columns value, then to put back the array element. So don't update the jqxArray if we don't
            // have an array element (createArray will also set rows and columns).
            if (this.templateControl === null) {
                return;
            }
            const oldRows = this.jqref.jqxArray('rows');
            const oldColumns = this.jqref.jqxArray('columns');
            if (this.rows !== oldRows || this.columns !== oldColumns) {
                if (this.jqref.val() === null) {
                    // Nested arrays can end up with a null value, triggering an error in the jqxArray when you resize that nested array.
                    // TODO : Track down why this happens
                    this.jqref.jqxArray({ value: [] });
                }
                this.jqref.jqxArray({ rows: this.rows, columns: this.columns });
            }
            const bigContainer = this.jqref.find('.jqx-array-big-container');
            const padding = parseInt(window.getComputedStyle(bigContainer[0]).padding);
            const jqxArrayElement = this.childElement;
            // This is intentionally not using computed width and height due to our CSS
            // (which specifies 100% width of the ni-array-viewer which doesn't have an updated size yet)
            const height = parseInt(jqxArrayElement.style.height) + 2 * padding;
            const width = parseInt(jqxArrayElement.style.width) + 2 * padding;
            const eventConfig = {
                bubbles: true,
                cancelable: true,
                detail: {
                    height: height,
                    width: width,
                    originalSource: this.childElement
                }
            };
            this.dispatchEvent(new CustomEvent('array-size-changed', eventConfig));
            this.updateFocusedCell();
        }
        setFont(fontSize, fontFamily, fontWeight, fontStyle, textDecoration) {
            super.setFont(fontSize, fontFamily, fontWeight, fontStyle, textDecoration);
            const jqrefIndexer = this.jqref.find(' .jqx-array-indexer'), fontProperties = {
                'font-size': fontSize,
                'font-family': fontFamily,
                'font-weight': fontWeight,
                'font-style': fontStyle
            };
            $(jqrefIndexer).css(fontProperties);
            this.jqref.trigger('refresh');
        }
        updateIndexerFont() {
            let jqrefIndexer = this.jqref.find(' .jqx-array-indexer').last();
            const fontProperties = $(jqrefIndexer).css(['font-size', 'font-family', 'font-weight', 'font-style']);
            jqrefIndexer = this.jqref.find(' .jqx-array-indexer');
            $(jqrefIndexer).css(fontProperties);
        }
        updateIndexerTheme() {
            this.jqref.find('.jqx-array-indexer').jqxNumberInput({ theme: THEME_NAME });
        }
        updateScrollbarTheme() {
            let i;
            const scrollBars = this.jqref.find('div.jqx-array-scrollbar-horizontal, div.jqx-array-scrollbar-vertical');
            for (i = 0; i < scrollBars.length; i++) {
                const curScrollBarRef = $(scrollBars[i]);
                // Note: If the properties return undefined, the scrollbar is not yet initialized. Trying to
                // change touchMode before initialization causes it to render incorrectly.
                const curTouchMode = curScrollBarRef.jqxScrollBar('touchMode');
                if (curTouchMode !== undefined && curTouchMode !== false) {
                    curScrollBarRef.jqxScrollBar({
                        touchMode: false // the default touchMode = 'auto' hides the scrollbar arrow buttons which causes issues with our CSS
                    });
                }
            }
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(ArrayViewer);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(ArrayViewer.prototype, 'ni-array-viewer', 'HTMLNIArrayViewer');
    NationalInstruments.HtmlVI.Elements.ArrayViewer = ArrayViewer;
}());
//# sourceMappingURL=ni-array-viewer.js.map