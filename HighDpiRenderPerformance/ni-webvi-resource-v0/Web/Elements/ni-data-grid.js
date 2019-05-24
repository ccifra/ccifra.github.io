"use strict";
//****************************************
// Data Grid
// DOM Registration: No
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const $ = NationalInstruments.Globals.jQuery;
    const NUM_HELPER = NationalInstruments.HtmlVI.NINumerics.Helpers;
    const JQX_NUM_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.JQXNumericValueConverter;
    const DROPDOWN_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.DropDownValueConverter;
    const DEEP_COPY_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.DeepCopyValueConverter;
    const NIType = window.NIType;
    // Static Properties
    const DEFAULT_ROW_HEIGHT = 22;
    const ID_DATAFIELD = '_id'; // The column datafield name for the 'id' column that shows the row index
    const STRING_TEMPLATE_TYPE = 'NI-STRING-CONTROL';
    const NUMERIC_TEMPLATE_TYPE = 'JQX-NUMERIC-TEXT-BOX';
    const CHECKBOX_TEMPLATE_TYPE = 'JQX-CHECK-BOX';
    const LED_TEMPLATE_TYPE = 'JQX-LED';
    const SLIDER_TEMPLATE_TYPE = 'JQX-SLIDER';
    const PROGRESSBAR_TEMPLATE_TYPE = 'JQX-PROGRESS-BAR';
    const DROPDOWN_TEMPLATE_TYPE = 'JQX-DROP-DOWN-LIST';
    const CENTERED_WIDGET_CONTAINER_CSS_CLASS = 'ni-widget-container-centered';
    // eslint-disable-next-line new-cap
    const JQX_MATH = new $.jqx.math();
    // Column Widgets
    const columnTypeHelpers = {};
    // Static Private Functions
    // Utility
    const getFalseValue = function () {
        return false;
    };
    const getElementHeight = function (elementSelector) {
        if (elementSelector.length > 0) {
            const element = elementSelector[0];
            if (element.style.display !== 'none' && element.style.visibility !== 'hidden') {
                return element.offsetHeight;
            }
        }
        return 0;
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
    const getAltRowSettings = function (start, step) {
        // We want Alt Start Index (the property that this element defines) to mean that the row at that index is the first
        // one in the alt color. The jqxGrid defines it differently (if rowindex > altstart && ((altstart + i) % (1 + altstep) == 0)).
        // We want (i - altstart) % (1 + altstep) == 0.
        // So basically we'd just need to negate startIndex, except that would mean the first colored row starts too early. So we add to that
        // based on multiples of the step size.
        const altstart = -start + Math.floor(2 * start / (step + 1)) * (step + 1);
        return {
            altstep: step,
            altstart: altstart
        };
    };
    const initJqxColumnWidget = function (dataGrid, row, column, value, cellElement) {
        const rowindex = (typeof row === 'number') ? row : row.visibleindex;
        const datafield = (typeof column === 'string') ? column : column.datafield;
        const niElement = cellElement.firstElementChild;
        niElement._dataGridRow = rowindex;
        niElement._dataGridColumn = datafield;
        columnTypeHelpers[niElement.nodeName].setWidgetValue(niElement, value);
    };
    const createJqxColumnWidget = function (dataGrid, row, column, value, cellElement) {
        if (!cellElement.firstElementChild) {
            // Sometimes when the jqxGrid calls this, row and column are jqxGridRow and jqxGridColumns.
            // So, if we don't get in a primitive value for those parameters, we assume we need to look
            // up thw row and column indices via a property on those objects.
            const rowIndex = (typeof row === 'number') ? row : row.visibleindex;
            const columnIndex = (typeof column === 'string') ? column : column.datafield;
            const niColumn = dataGrid.columns[columnIndex];
            const templateControl = niColumn.firstElementChild;
            const templateType = templateControl.nodeName;
            const columnTypeHelper = columnTypeHelpers[templateType];
            const control = NI_SUPPORT.cloneControlElement(templateControl);
            // TODO mraj we also have to clear other properties added by niElementExtensions to prevent conflicts with modeling
            control.clearProperties();
            NI_SUPPORT.setTemplateId(control, templateControl.niControlId);
            control._dataGridRow = rowIndex;
            control._dataGridColumn = columnIndex;
            control._preventModelCreation = true;
            control.visible = true;
            control.style.width = '100%';
            control.style.height = '100%';
            control.disabled = dataGrid.disabled;
            columnTypeHelper.setWidgetValue(control, value, templateControl);
            cellElement.appendChild(control);
            if (typeof columnTypeHelper.configureWidget === 'function') {
                columnTypeHelper.configureWidget(dataGrid, control, cellElement);
            }
            if (typeof columnTypeHelper.resize === 'function') {
                columnTypeHelper.resize(control, { width: niColumn.width, height: dataGrid.coercedRowHeight });
            }
        }
    };
    const initCustomColumnType = function (dataGrid, jqxColumn) {
        jqxColumn.columntype = 'custom';
        jqxColumn.createwidget = function (row, column, value, cellElement) {
            if (!dataGrid._validState && dataGrid._refreshRequested) {
                return;
            }
            createJqxColumnWidget(dataGrid, row, column, value, cellElement);
        };
        jqxColumn.initwidget = function (row, column, value, cellElement) {
            if (!dataGrid._validState && dataGrid._refreshRequested) {
                return;
            }
            initJqxColumnWidget(dataGrid, row, column, value, cellElement);
        };
        jqxColumn.cellbeginedit = getFalseValue;
    };
    const getAggregateStringValue = function (aggregate, val) {
        const digits = NUM_HELPER.coerceDisplayDigits(aggregate.significantDigits, aggregate.precisionDigits);
        if (aggregate.format === 'exponential') {
            return JQX_MATH.getDecimalNotation(val, aggregate.format, digits.precisionDigits, digits.significantDigits);
        }
        if (digits.significantDigits !== undefined) {
            return Number(val.toPrecision(digits.significantDigits)).toString();
        }
        else if (digits.precisionDigits !== undefined) {
            return val.toFixed(digits.precisionDigits);
        }
        else {
            throw new Error('Unexpected significantDigits / precisionDigits for column aggregate');
        }
    };
    const aggregatesRenderer = function (aggregates, jqxAggregates, validState) {
        let first = true;
        let alignment = '';
        if (aggregates.horizontalAlignment !== undefined) {
            alignment = ' style=\'text-align:' + aggregates.horizontalAlignment + '\'';
        }
        let renderstring = '<div class=\'ni-aggregate-box\'' + alignment + '>';
        if (validState) {
            $.each(jqxAggregates, function (key, value) {
                const aggregate = aggregates.items[key];
                let label = NI_SUPPORT.escapeHtml(aggregate.label);
                if (label === undefined) {
                    label = '';
                }
                if (first) {
                    first = false;
                }
                else {
                    renderstring += '<br />';
                }
                renderstring += '<strong>' + label + ':</strong> ' + getAggregateStringValue(aggregate, value);
            });
        }
        renderstring += '</div>';
        return renderstring;
    };
    // Support (column initialization, default values, value updating) for all supported column types
    const fireValueChanged = function (dataGrid, oldValue) {
        dataGrid.dispatchEvent(new CustomEvent('value-changed', {
            bubbles: true,
            cancelable: false,
            detail: {
                newValue: dataGrid.value,
                oldValue: oldValue
            }
        }));
    };
    const addTemplateControlMutationObserver = function (dataGrid, column) {
        const templateControl = column.firstElementChild;
        if (templateControl === null) {
            return;
        }
        const columnTypeHelper = columnTypeHelpers[templateControl.nodeName];
        const observer = new window.MutationObserver(function (mutations) {
            let changedAttributes, i;
            if (columnTypeHelper.templateControlAttributeChanged !== undefined) {
                changedAttributes = [];
                i = 0;
                mutations.forEach(function (mutation) {
                    const attrName = mutation.attributeName;
                    if (attrName !== null) {
                        changedAttributes[i] = attrName;
                        i++;
                    }
                });
                columnTypeHelper.templateControlAttributeChanged(dataGrid, column, changedAttributes);
            }
        });
        const observerConfig = { attributes: true };
        column._niColumnTemplateControlObserver = observer;
        if (typeof observer.observe === 'function') {
            observer.observe(templateControl, observerConfig);
        }
    };
    const removeTemplateControlMutationObserver = function (column) {
        const columnObserver = column._niColumnTemplateControlObserver;
        if (columnObserver !== undefined && (typeof columnObserver.disconnect === 'function')) {
            columnObserver.disconnect();
            column._niColumnTemplateControlObserver = undefined;
        }
    };
    const dashToCamelCase = function (attrName) {
        return attrName.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    };
    const templateControlAttributeChangedNIElement = function (dataGrid, column, attributes) {
        const columnDataField = column.index.toString();
        const templateControl = column.firstElementChild;
        let j;
        if (templateControl === null) {
            // It's possible that this mutation observer is triggered when the column has no control (e.g.
            // changing the type of a numeric)
            return;
        }
        const templateAttributeValues = {};
        const templatePropertyValues = {};
        let attrName, camelCaseName, control;
        for (j = 0; j < attributes.length; j++) {
            attrName = attributes[j];
            if (templateControl.hasAttribute(attrName)) {
                templateAttributeValues[attrName] = templateControl.getAttribute(attrName);
            }
            else if (NI_SUPPORT.isJQXElement(templateControl)) {
                camelCaseName = dashToCamelCase(attrName);
                if (templateControl[camelCaseName] !== undefined) {
                    templatePropertyValues[camelCaseName] = templateControl[camelCaseName];
                }
            }
        }
        const matchedControls = dataGrid.jqref[0].querySelectorAll(templateControl.tagName);
        let i;
        for (i = 0; i < matchedControls.length; i++) {
            control = matchedControls[i];
            if (control._dataGridColumn === columnDataField) {
                for (j = 0; j < attributes.length; j++) {
                    attrName = attributes[j];
                    camelCaseName = dashToCamelCase(attrName);
                    if (templateAttributeValues[attrName] !== undefined) {
                        control.setAttribute(attrName, templateAttributeValues[attrName]);
                    }
                    else if (templatePropertyValues[camelCaseName] !== undefined) {
                        control[camelCaseName] = templatePropertyValues[camelCaseName];
                    }
                    else {
                        control.removeAttribute(attrName);
                    }
                }
            }
        }
    };
    const addJqxNumericValueChangedListener = function (dataGrid, widgetElement) {
        widgetElement.addEventListener(widgetElement.valuePropertyDescriptor.eventName, function (event) {
            const niType = JQX_NUM_VAL_CONVERTER.convertJQXTypeToNI(widgetElement);
            const modelValue = JQX_NUM_VAL_CONVERTER.convertBack(event.detail.value, niType);
            dataGrid.templateControlValueChanged(widgetElement, modelValue);
        });
    };
    const addJqxToggleBooleanValueChangedListener = function (dataGrid, widgetElement) {
        widgetElement.addEventListener('change', function (e) {
            if (widgetElement.readonly !== true && e.detail.changeType !== 'api') {
                const row = widgetElement._dataGridRow, column = widgetElement._dataGridColumn;
                const curValue = dataGrid.jqxValue[row][column];
                const newValue = e.detail.value;
                if (curValue !== newValue) {
                    dataGrid.templateControlValueChanged(widgetElement, newValue);
                }
            }
        });
    };
    const keyDownStopPropagation = function (e) {
        // This keydown handler is meant to be hooked up to template control
        // types that use keyboard input (e.g. numeric text box and string).
        // It prevents keydown events from bubbling up to the data grid.
        // (The data grid has its own key listeners which interfere with
        // the control's, otherwise.)
        if (e.stopPropagation !== undefined) {
            e.stopPropagation();
        }
    };
    // Add Rows Tool Bar
    const appendAddRowsToolbar = function (dataGrid) {
        const innerDiv = $('<div style=\'margin:5px;\'></div>');
        const rowCountInput = $('<div class=\'ni-row-count-text-field-box\' />');
        innerDiv.append(rowCountInput);
        innerDiv.append($('<span class=\'ni-text\'>' + dataGrid.addRowsLabel + ': ' + '</span>'));
        const addButton = $('<input type=\'button\' class=\'ni-add-rows-button\' />');
        innerDiv.append(addButton);
        const outerDiv = $('<div class=\'ni-add-rows-toolbar\'></div>');
        outerDiv.append(innerDiv);
        if (dataGrid.readOnly || !dataGrid.showAddRowsToolBar) {
            outerDiv[0].style.display = 'none';
        }
        dataGrid.jqref.append(outerDiv);
        dataGrid.addRowsToolbarRef = outerDiv;
        rowCountInput.jqxNumberInput({ inputMode: 'simple', decimalDigits: 0, min: 1, max: 1000, value: 1, width: 53, height: 22 });
        rowCountInput[0].firstElementChild.style.width = '50px';
        rowCountInput.find(' input').addClass('ni-row-count-text-field');
        addButton[0].value = dataGrid.addRowsButtonLabel;
        addButton.jqxButton({ width: 50, height: 22 });
        addButton.on('click', function () {
            if (dataGrid.jqref === undefined || dataGrid.disabled) {
                return;
            }
            dataGrid.addEmptyRows(rowCountInput.jqxNumberInput('val'));
            addButton.blur();
        });
    };
    columnTypeHelpers[STRING_TEMPLATE_TYPE] = {
        initializeColumn: initCustomColumnType,
        setWidgetValue: function (element, value) {
            element.textNonSignaling = value;
        },
        getDefaultValue: function () {
            return '';
        },
        validateValue: function (val) {
            return typeof val === 'string';
        },
        templateControlAttributeChanged: templateControlAttributeChangedNIElement,
        configureWidget: function (dataGrid, widgetElement) {
            widgetElement.addEventListener('text-changed', function (evt) {
                dataGrid.templateControlValueChanged(widgetElement, evt.detail.text);
            });
            widgetElement.addEventListener('keydown', keyDownStopPropagation, false);
        }
    };
    columnTypeHelpers[NUMERIC_TEMPLATE_TYPE] = {
        initializeColumn: initCustomColumnType,
        setWidgetValue: function (jqxElement, value) {
            const niType = JQX_NUM_VAL_CONVERTER.convertJQXTypeToNI(jqxElement);
            jqxElement.value = JQX_NUM_VAL_CONVERTER.convert(value, niType);
        },
        validateValue: function (val, jqxElement) {
            const niType = JQX_NUM_VAL_CONVERTER.convertJQXTypeToNI(jqxElement);
            if (niType.is64BitInteger() || niType.isComplex()) {
                return typeof val === 'string';
            }
            return typeof val === 'number';
        },
        getDefaultValue: function (templateElement) {
            const defaultValue = 0;
            const niType = JQX_NUM_VAL_CONVERTER.convertJQXTypeToNI(templateElement);
            return JQX_NUM_VAL_CONVERTER.convertBack(defaultValue, niType);
        },
        templateControlAttributeChanged: templateControlAttributeChangedNIElement,
        configureWidget: function (dataGrid, widgetElement) {
            addJqxNumericValueChangedListener(dataGrid, widgetElement);
            widgetElement.addEventListener('keydown', keyDownStopPropagation, false);
        }
    };
    columnTypeHelpers[CHECKBOX_TEMPLATE_TYPE] = {
        initializeColumn: initCustomColumnType,
        setWidgetValue: function (jqxElement, value) {
            jqxElement.checked = value;
        },
        validateValue: function (val) {
            return typeof val === 'boolean';
        },
        templateControlAttributeChanged: templateControlAttributeChangedNIElement,
        configureWidget: function (dataGrid, widgetElement) {
            widgetElement.parentElement.classList.add(CENTERED_WIDGET_CONTAINER_CSS_CLASS);
            addJqxToggleBooleanValueChangedListener(dataGrid, widgetElement);
        },
        getDefaultValue: getFalseValue
    };
    columnTypeHelpers[LED_TEMPLATE_TYPE] = {
        initializeColumn: initCustomColumnType,
        setWidgetValue: function (jqxElement, value) {
            jqxElement.checked = value;
        },
        validateValue: function (val) {
            return typeof val === 'boolean';
        },
        templateControlAttributeChanged: templateControlAttributeChangedNIElement,
        configureWidget: function (dataGrid, widgetElement) {
            widgetElement.parentElement.classList.add(CENTERED_WIDGET_CONTAINER_CSS_CLASS);
            addJqxToggleBooleanValueChangedListener(dataGrid, widgetElement);
            widgetElement.style.position = 'absolute';
        },
        getDefaultValue: getFalseValue
    };
    columnTypeHelpers[SLIDER_TEMPLATE_TYPE] = {
        initializeColumn: initCustomColumnType,
        setWidgetValue: function (jqxElement, value) {
            const niType = JQX_NUM_VAL_CONVERTER.convertJQXTypeToNI(jqxElement);
            jqxElement.value = JQX_NUM_VAL_CONVERTER.convert(value, niType);
        },
        validateValue: function (val, jqxElement) {
            const niType = JQX_NUM_VAL_CONVERTER.convertJQXTypeToNI(jqxElement);
            if (niType.is64BitInteger() || niType.isComplex()) {
                return typeof val === 'string';
            }
            return typeof val === 'number';
        },
        getDefaultValue: function (templateElement) {
            const defaultValue = 0;
            const niType = JQX_NUM_VAL_CONVERTER.convertJQXTypeToNI(templateElement);
            return JQX_NUM_VAL_CONVERTER.convertBack(defaultValue, niType);
        },
        templateControlAttributeChanged: templateControlAttributeChangedNIElement,
        configureWidget: function (dataGrid, widgetElement) {
            addJqxNumericValueChangedListener(dataGrid, widgetElement);
        }
    };
    columnTypeHelpers[PROGRESSBAR_TEMPLATE_TYPE] = {
        initializeColumn: initCustomColumnType,
        setWidgetValue: function (element, value) {
            element.value = value;
        },
        validateValue: function (val) {
            return typeof val === 'number';
        },
        getDefaultValue: function () {
            return 0;
        },
        templateControlAttributeChanged: templateControlAttributeChangedNIElement
    };
    columnTypeHelpers[DROPDOWN_TEMPLATE_TYPE] = {
        initializeColumn: initCustomColumnType,
        setWidgetValue: function (niElement, value, templateControl) {
            if (templateControl !== undefined) {
                const dataSource = (typeof templateControl.dataSource !== 'string') ? JSON.stringify(templateControl.dataSource) : templateControl.dataSource;
                niElement.setAttribute('data-source', dataSource);
                niElement.setAttribute('selected-indexes', JSON.stringify(DROPDOWN_VAL_CONVERTER.convert(value)));
            }
            else {
                niElement.selectedIndexes = DROPDOWN_VAL_CONVERTER.convert(value);
            }
        },
        validateValue: function (val) {
            return Array.isArray(val) || typeof val === 'number';
        },
        getDefaultValue: function () {
            return 0;
        },
        templateControlAttributeChanged: templateControlAttributeChangedNIElement,
        configureWidget: function (dataGrid, widgetElement) {
            widgetElement.dropDownAppendTo = 'body';
            widgetElement.addEventListener('change', function (evt) {
                dataGrid.templateControlValueChanged(widgetElement, evt.detail.index);
            });
        }
    };
    class DataGrid extends NationalInstruments.HtmlVI.Elements.Visual {
        // Public Prototype Methods
        getColumnWidths() {
            // Pinned columns are first in the records array.  We need to sort them by index.
            const columnWidths = new Array(this.sortedColumnIndices.length);
            const columns = this.jqref.jqxGrid('columns')['records'];
            this.sortedColumnIndices.forEach(function (columnIndex, i) {
                columnWidths[columnIndex] = columns[i].width;
            });
            columnWidths.shift(); // Removing the always present "row header column"
            return columnWidths;
        }
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = DataGrid.prototype;
            Object.defineProperty(proto, 'value', {
                get: function () {
                    // it should deep copy to prevent internal state from being coupled externally
                    return this.deepCloneData();
                },
                set: function (val) {
                    const oldValue = this.deepCloneData();
                    this.updateData(val);
                    fireValueChanged(this, oldValue);
                },
                configurable: false,
                enumerable: true
            });
            Object.defineProperty(proto, 'valueNonSignaling', {
                get: function () {
                    return this.deepCloneData();
                },
                set: function (val) {
                    this.updateData(val);
                },
                configurable: false,
                enumerable: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'niType',
                defaultValue: '{"name":"Array","rank":1,"subtype":{"name":"Cluster","fields":[]}}'
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'rowHeaderVisible',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'columnHeaderVisible',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'showAddRowsToolBar',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'allowSorting',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'allowPaging',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'allowFiltering',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'allowGrouping',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'rowHeight',
                defaultValue: DEFAULT_ROW_HEIGHT
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'altRowColors',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'altRowStart',
                defaultValue: 1
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'altRowStep',
                defaultValue: 1
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'isInEditMode',
                defaultValue: false,
                fireEvent: false,
                addNonSignalingProperty: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'selectedColumn',
                defaultValue: -1
            });
            NI_SUPPORT.setValuePropertyDescriptor(targetPrototype, 'value', 'value', 'valueNonSignaling', 'value-changed');
        }
        createdCallback() {
            super.createdCallback();
            // Public Instance Properties
            this.columns = [];
            this.selectedColumnDataField = undefined;
            this.sortedColumnIndices = [];
            this.parsedValue = [];
            this.niTypeInstance = undefined;
            this.jqxValue = [];
            this.columnObservers = [];
            this.pageSize = 0;
            this.addRowsButtonLabel = NI_SUPPORT.i18n('msg_datagrid_addrowsbuttonlabel');
            this.addRowsLabel = NI_SUPPORT.i18n('msg_datagrid_addrowslabel');
            this.coercedRowHeight = DEFAULT_ROW_HEIGHT;
            this.showAggregates = false;
            this.maxAggregateCountPerColumn = 0;
            // Private Instance Properties
            this._validState = true;
        }
        connectedCallback() {
            // Public Instance Properties
            this.parsedValue = parseInitialValue(this.getAttribute('value'));
            this.niTypeInstance = new NIType(this.niType);
            super.connectedCallback(); // Call the base implementation after having set any properties that are expected to be synced to the model.
        }
        getDefaultColumns() {
            // This adds the leftmost 'row index' column, which will be hidden if the 'row header visible' property is false.
            return [{
                    text: '',
                    datafield: ID_DATAFIELD,
                    width: 50,
                    cellsalign: 'center',
                    columntype: 'custom',
                    createwidget: function (row, column, value, cellElement) {
                        if (!cellElement.firstElementChild) {
                            $(cellElement).append('<div style=\'width: 100%; height: 100%; display: table; text-align: center;\'>' +
                                '<span style=\'display: table-cell; vertical-align: middle;\'>' + value.toString() + '</span></div>');
                        }
                    },
                    initwidget: function (row, column, value, cellElement) {
                        const outerDiv = cellElement.firstElementChild;
                        if (outerDiv !== null) {
                            outerDiv.firstElementChild.textContent = value.toString();
                        }
                    },
                    cellbeginedit: getFalseValue,
                    hidden: !this.rowHeaderVisible,
                    pinned: this.columns.some(function (col) {
                        return col.pinned;
                    })
                }];
        }
        setFont() {
            // Don't call the parent / base method, which changes the font properties on our CSS style. Changing fonts on the data grid shouldn't
            // affect the headers / toolbar / etc. Each column can have its font settings changed individually via styling the template control
            // for that column.
            // super.setFont(fontSize, fontFamily, fontWeight, fontStyle, textDecoration);
        }
        templateControlValueChanged(element, modelValue) {
            const row = element._dataGridRow, column = element._dataGridColumn;
            const curValue = this.jqxValue[row][column];
            const oldValue = this.deepCloneData();
            if (curValue !== modelValue) {
                this.parsedValue[row][this.columns[column].fieldName] = modelValue;
                fireValueChanged(this, oldValue);
            }
        }
        updateJqxColumnConfig() {
            const that = this;
            let i;
            const columns = this.getDefaultColumns();
            let newColumn, templateType, templateElement, columnTypeHelper;
            let aggregates, showAggregates = false, aggregateCount = 0;
            let maxAggregateCountPerColumn = 0;
            const sortedIndices = [0];
            let validState = true;
            // Sanity check columns. If we're in an inconsistent state (missing column, 2 columns with the same index, no template control for a column,
            // etc), then skip rendering for now.
            for (i = 0; i < this.columns.length; i++) {
                if (i !== this.columns[i].index || this.columns[i].firstElementChild === null) {
                    validState = false;
                    break;
                }
            }
            if (validState) {
                for (i = 0; i < this.columns.length; i++) {
                    if (this.columns[i].pinned) {
                        sortedIndices.push(i + 1);
                    }
                }
                // Note: using forEach instead of a regular for loop here because otherwise, the value of 'column' in the inner function
                // would be incorrect due to how closures work in loops in JS
                this.columns.forEach(function (column, i) {
                    column.parsedAggregates = JSON.parse(column.aggregates);
                    aggregates = [];
                    aggregateCount = 0;
                    for (const aggregate in column.parsedAggregates.items) {
                        if (column.parsedAggregates.items.hasOwnProperty(aggregate)) {
                            aggregates.push(aggregate);
                            aggregateCount++;
                            showAggregates = true;
                        }
                    }
                    maxAggregateCountPerColumn = Math.max(maxAggregateCountPerColumn, aggregateCount);
                    newColumn = {
                        align: 'center',
                        text: NI_SUPPORT.escapeHtml(column.header),
                        datafield: i.toString(),
                        width: column.width,
                        pinned: column.pinned,
                        aggregates: aggregates
                    };
                    if (aggregates.length > 0) {
                        newColumn.aggregatesrenderer = function (aggregates) {
                            return aggregatesRenderer(column.parsedAggregates, aggregates, that._validState);
                        };
                    }
                    if (!column.pinned) {
                        sortedIndices.push(i + 1);
                    }
                    templateElement = column.firstElementChild;
                    templateType = templateElement.nodeName;
                    if (!columnTypeHelpers.hasOwnProperty(templateType)) {
                        throw new Error('Unsupported template element type for column ' + i + ': ' + templateType);
                    }
                    columnTypeHelper = columnTypeHelpers[templateType];
                    column._niColumnDefaultValue = columnTypeHelper.getDefaultValue(templateElement);
                    columnTypeHelper.initializeColumn(that, newColumn);
                    if (that.jqxValue.length > 0) {
                        // Basic value validation - if the value is invalid for this column type (due to being in the middle of column reordering, or
                        // updating the control in a column), abort the render / update. The assumption is that the editor will coerce the value and send that
                        // over, then we'll re-render at that point.
                        if (!columnTypeHelper.validateValue(that.jqxValue[0][newColumn.datafield], templateElement)) {
                            validState = false;
                        }
                    }
                    if (!NationalInstruments.HtmlVI.NISupport.isElement(templateElement)) {
                        // JQX element not yet initialized
                        validState = false;
                        window.requestAnimationFrame(function () {
                            that.requestRefresh();
                        });
                    }
                    columns.push(newColumn);
                });
            }
            if (validState) {
                this.showAggregates = showAggregates;
                this.maxAggregateCountPerColumn = maxAggregateCountPerColumn;
                this.sortedColumnIndices = sortedIndices;
                this.jqxColumnConfig = columns;
            }
            this._validState = validState;
        }
        addEmptyRows(count) {
            let row, jqxRow, rows, i, j, n, column, oldLength, oldValue;
            if (count > 0) {
                oldValue = this.deepCloneData();
                rows = [];
                oldLength = this.parsedValue.length;
                n = oldLength;
                for (i = 0; i < count; i++) {
                    row = {};
                    jqxRow = {};
                    jqxRow[ID_DATAFIELD] = n++;
                    for (j = 0; j < this.columns.length; j++) {
                        column = this.columns[j];
                        jqxRow[j] = column._niColumnDefaultValue;
                        row[column.fieldName] = column._niColumnDefaultValue;
                    }
                    rows.push(jqxRow);
                    this.parsedValue.push(row);
                }
                if (this.showAggregates && oldLength === 0) {
                    // If we have data and we didn't before, show the aggregates bar as needed.
                    this.updateStatusBar();
                    this.updatePageSize();
                }
                this.jqref.jqxGrid('addrow', null, rows);
                fireValueChanged(this, oldValue);
            }
        }
        getColumnNames() {
            if (this.niTypeInstance === undefined) {
                return [];
            }
            return this.niTypeInstance.getSubtype().getFields();
        }
        updateJqxValueFromParsedValue() {
            // jqxValue and parsedValue both represent the full data set, but with different field names.
            // Example: If you have 'Column A' and 'Column B' in the editor and 1 row of data, you would have
            // parsedValue[0]['Column A'] and parsedValue[0]['Column B'], versus
            // jqxValue[0]['0'] and jqxValue[0]['1'] for the cell values.
            // There's 2 main reasons why jqxValue and parsedValue can't be the same array instance (and why the
            // field names are different):
            // 1. Each column in the jqxGrid has a datafield (string property) that's the field name in the row objects,
            //    where the data should come from for that column. The ID / row index column also must have a datafield.
            //    If we directly map the diagram cluster field names as the datafield, a user-specified name could conflict
            //    with the name we pick for the ID column's datafield. So, we have a copy with different field names that
            //    we know won't conflict.
            // 2. When you give the jqxGrid an array data source, it sets additional fields in the row objects inside the
            //    array you give it. We don't want those additional (internal) fields to still be in the array of objects that
            //    we hand back to the model when the user changes data. So, we'd need a copy anyway.
            let rowIndex, j, curRow;
            const result = [];
            const changedRows = [];
            const dataGridFields = this.getColumnNames();
            for (rowIndex = 0; rowIndex < this.parsedValue.length; rowIndex++) {
                curRow = {};
                curRow[ID_DATAFIELD] = rowIndex;
                let changedRow = false;
                for (j = 0; j < dataGridFields.length; j++) {
                    const cellValue = this.parsedValue[rowIndex][dataGridFields[j]];
                    curRow[j] = cellValue;
                    if (rowIndex < this.jqxValue.length) {
                        const jqxCell = this.jqxValue[rowIndex]['' + j];
                        changedRow = changedRow || jqxCell !== cellValue;
                    }
                    else {
                        changedRow = true;
                    }
                }
                if (changedRow) {
                    changedRows.push(rowIndex);
                }
                result.push(curRow);
            }
            this.jqxValue = result;
            return changedRows;
        }
        initializeColumnsAndData() {
            this.updateJqxColumnConfig();
            this.updateJqxValueFromParsedValue();
            this.dataSource = {
                datatype: 'array',
                localdata: this.jqxValue
            };
            // eslint-disable-next-line new-cap
            const dataAdapter = new $.jqx.dataAdapter(this.dataSource);
            // Fix for jqxGrid / jqxDataAdapter stripping out NaN values
            dataAdapter.getvaluebytype = function (value, datafield) {
                if (value === 'NaN' && datafield.type === 'number') {
                    return value;
                }
                return $.jqx.dataAdapter.prototype.getvaluebytype.call(dataAdapter, value, datafield);
            };
            this.dataAdapter = dataAdapter;
            this.updateStatusBar(); // Make sure aggregates will show, if enabled
            if (this._validState) {
                this.jqref.jqxGrid({ columns: this.jqxColumnConfig, source: this.dataAdapter });
            }
        }
        getSettings() {
            const altRowSettings = getAltRowSettings(this.altRowStart, this.altRowStep);
            return {
                editable: !this.disabled && !this.readOnly,
                showemptyrow: false,
                selectionmode: 'none',
                showheader: this.columnHeaderVisible,
                columnsresize: true,
                enablehover: false,
                showsortmenuitems: false,
                sortable: this.allowSorting,
                filterable: this.allowFiltering,
                showfilterrow: this.allowFiltering,
                pageable: this.allowPaging,
                groupable: this.allowGrouping,
                altrows: this.altRowColors,
                altstart: altRowSettings.altstart,
                altstep: altRowSettings.altstep,
                columnsheight: DEFAULT_ROW_HEIGHT,
                rowsheight: this.coercedRowHeight,
                groupsexpandedbydefault: true,
                disabled: this.disabled,
                touchMode: false
            };
        }
        setSelectedColumn(column) {
            let newSelectedDataField, columnToSelect;
            if (!this.jqref) {
                return;
            }
            if (!this.isInEditMode) {
                return;
            }
            if (column >= 0 && column < this.columns.length) {
                columnToSelect = column;
                newSelectedDataField = column.toString();
            }
            else {
                columnToSelect = -1;
            }
            if (columnToSelect !== this.selectedColumn) {
                this.selectedColumn = columnToSelect;
            }
            if (this.selectedColumnDataField !== newSelectedDataField) {
                if (this.selectedColumnDataField !== undefined) {
                    const jqxColumn = this.jqref.jqxGrid('getcolumn', this.selectedColumnDataField);
                    if (jqxColumn !== null && jqxColumn.element !== null && jqxColumn.element !== undefined) {
                        $(jqxColumn.element).removeClass('ni-selected-header');
                    }
                }
                this.selectedColumnDataField = newSelectedDataField;
                this.refreshSelectedColumn();
                this.dispatchEvent(new CustomEvent('selected-column-changed', {
                    detail: { selectedColumn: this.selectedColumn }
                }));
            }
        }
        refreshSelectedColumn() {
            let i, jqxColumn, leftIndex;
            if (this.isInEditMode) {
                if (this.selectedColumn === -1) {
                    for (i = 0; i < this.jqxColumnConfig.length; i++) {
                        jqxColumn = this.jqref.jqxGrid('getcolumn', this.jqxColumnConfig[i].datafield);
                        if (jqxColumn !== null && jqxColumn !== undefined) {
                            jqxColumn.cellclassname = '';
                        }
                    }
                }
                else {
                    leftIndex = this.sortedColumnIndices[this.sortedColumnIndices.indexOf(this.selectedColumn + 1) - 1];
                    for (i = 0; i < this.jqxColumnConfig.length; i++) {
                        jqxColumn = this.jqref.jqxGrid('getcolumn', this.jqxColumnConfig[i].datafield);
                        if (jqxColumn !== null && jqxColumn !== undefined) {
                            if (i === leftIndex) {
                                jqxColumn.cellclassname = 'ni-selected-cell';
                            }
                            else if (i === this.selectedColumn + 1) {
                                jqxColumn.cellclassname = 'ni-selected-cell';
                                $(jqxColumn.element).addClass('ni-selected-header');
                            }
                            else {
                                jqxColumn.cellclassname = '';
                            }
                        }
                    }
                }
                // Trigger a 'soft refresh' so the jqxGrid will re-query the cell CSS classes, but not recreate widgets
                $(this.jqref).jqxGrid('clearselection');
            }
        }
        updateCoercedRowHeight() {
            this.coercedRowHeight = this.rowHeight >= 1 ? this.rowHeight : DEFAULT_ROW_HEIGHT;
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            const that = this;
            let widgetSettings, childElement, childColumns, jqref;
            if (firstCall === true) {
                this.niTypeInstance = new NIType(this.niType);
                childColumns = this.findInitialColumns();
                this.addColumnListeners(childColumns);
                this.updateCoercedRowHeight();
                widgetSettings = this.getSettings();
                widgetSettings.ready = function () {
                    if (childColumns.length === 0) {
                        that.initializeColumnsAndData();
                    }
                    // Adding CSS class names
                    jqref.find(' .jqx-grid-statusbar').addClass('ni-status-bar');
                    jqref.addClass('ni-grid-widget');
                    jqref.addClass('ni-grid-widget-content');
                    jqref.find(' .jqx-widget').addClass('ni-grid-widget');
                    jqref.find(' .jqx-widget-content').addClass('ni-grid-widget-content');
                    jqref.find(' .jqx-grid-groups-header').addClass('ni-groups-header');
                    jqref.find(' .jqx-grid-pager').addClass('ni-pager-box');
                    jqref.find(' .jqx-grid-pager-input').addClass('ni-pager-text-field');
                    jqref.find(' .jqx-dropdownlist-state-normal').addClass('ni-selector');
                    jqref.find(' .jqx-max-size').addClass('ni-filter-row-box');
                    jqref.find(' .jqx-grid-column-header').addClass('ni-column-header');
                    jqref.find(' .jqx-grid-content').addClass('ni-grid-content');
                    jqref.find(' .jqx-grid-cell-filter-row').addClass('ni-filter-row');
                    jqref.find(' .jqx-grid-cell').addClass('ni-cell');
                    jqref.find(' .jqx-grid-group-cell').addClass('ni-group-cell');
                };
                childElement = document.createElement('div');
                childElement.style.width = '100%';
                childElement.style.height = '100%';
                // // Currently, we don't want changing the data grid headers to affect the row / column header font, or the
                // // statusbar / toolbar fonts, so we're setting the font we want explicitly here
                // childElement.style.fontSize = '12px';
                // childElement.style.fontFamily = 'Segoe UI, sans-serif';
                // childElement.style.fontWeight = 'normal';
                // childElement.style.fontStyle = 'normal';
                this.appendChild(childElement);
                jqref = $(childElement);
                this.jqref = jqref;
                jqref.jqxGrid(widgetSettings);
                appendAddRowsToolbar(this);
                this.updateStatusBar();
                this.updatePagingSettings();
                jqref.on('cellendedit', function (event) {
                    const oldValue = that.deepCloneData();
                    const rowindex = event.args.rowindex, datafield = event.args.datafield, value = event.args.value;
                    that.jqxValue[rowindex][datafield] = value;
                    that.parsedValue[rowindex][that.columns[datafield].fieldName] = value;
                    fireValueChanged(that, oldValue);
                });
                jqref.on('columnclick', function (event) {
                    const origMouseEvent = event.args.originalEvent.originalEvent;
                    that.setSelectedColumn(parseInt(event.args.datafield));
                    if (origMouseEvent !== undefined && origMouseEvent.x !== undefined && origMouseEvent.y !== undefined) {
                        that.handledClickEvent = { x: origMouseEvent.x, y: origMouseEvent.y };
                    }
                });
                jqref.on('cellclick', function (event) {
                    const origMouseEvent = event.args.originalEvent;
                    that.setSelectedColumn(parseInt(event.args.datafield));
                    if (origMouseEvent !== undefined && origMouseEvent.pageX !== undefined && origMouseEvent.pageY !== undefined) {
                        that.handledClickEvent = { x: origMouseEvent.pageX, y: origMouseEvent.pageY };
                    }
                });
                jqref.on('click', function (event) {
                    // If a click is on the data grid but not on its cells or columns (which are handled above), deselect
                    // the currently active column
                    if (event.pageX !== undefined && that.handledClickEvent !== undefined &&
                        event.pageX === that.handledClickEvent.x && event.pageY === that.handledClickEvent.y) {
                        return;
                    }
                    else if (event.detail !== undefined && that.handledClickEvent !== undefined &&
                        event.detail.pageX === that.handledClickEvent.x && event.detail.pageY === that.handledClickEvent.y) {
                        return;
                    }
                    that.setSelectedColumn(-1);
                    that.handledClickEvent = undefined;
                });
                jqref.on('columnresized', function (event) {
                    const args = event.args;
                    const dataField = args.datafield;
                    const newWidth = args.newwidth;
                    const newHeight = that.coercedRowHeight;
                    const column = that.columns[dataField];
                    if (column === undefined) {
                        if (dataField !== ID_DATAFIELD) {
                            throw new Error('Column not found with dataField: ' + dataField);
                        }
                        return;
                    }
                    const templateControl = column.firstElementChild;
                    const columnHelper = columnTypeHelpers[templateControl.nodeName];
                    let i, control;
                    if (typeof columnHelper.resize !== 'function') {
                        return;
                    }
                    const matchedControls = jqref[0].querySelectorAll(templateControl.tagName);
                    for (i = 0; i < matchedControls.length; i++) {
                        control = matchedControls[i];
                        if (control._dataGridColumn === dataField) {
                            columnHelper.resize(control, { width: newWidth, height: newHeight });
                        }
                    }
                });
                window.addEventListener('resize', function () {
                    if (that.controlResizeMode === 'fixed') {
                        return;
                    }
                    const computedStyle = window.getComputedStyle(that);
                    that.forceResize({
                        width: computedStyle.width,
                        height: computedStyle.height
                    });
                });
            }
            return firstCall;
        }
        forceResize(size) {
            super.forceResize(size);
            let jqref = this.jqref;
            if (jqref === undefined) {
                jqref = $(this).children('div');
            }
            jqref.jqxGrid(size);
            this.updatePageSize();
        }
        updateColumns() {
            if (this.jqref === undefined || this.parentElement === null) {
                return;
            }
            // Cancel any pending edits before refreshing columns
            this.jqref.jqxGrid('endcelledit');
            this.updateJqxColumnConfig();
            if (!this._validState) {
                return;
            }
            this.jqref.jqxGrid({ columns: this.jqxColumnConfig });
            this.refreshSelectedColumn();
        }
        validateState() {
            if (this.jqref === undefined || this.parentElement === null) {
                return;
            }
            // Cancel any pending edits before validating / refreshing columns
            this.jqref.jqxGrid('endcelledit');
            // updateJqxValueFromParsedValue: this updates jqxValue based on the current
            // columns & parsed value. We use jqxValue to validate (because thats the
            // value the jqxGrid operates on), so we need to update it first.
            this.updateJqxValueFromParsedValue();
            this.updateJqxColumnConfig();
        }
        refreshIfValid() {
            if (this.jqref === undefined || this.parentElement === null) {
                return;
            }
            this.validateState();
            if (!this._validState) {
                return;
            }
            this.dataSource.localdata = this.jqxValue;
            this.jqref.jqxGrid('beginupdate', true);
            // jqxGrid has a bug where it tries to remove the filter widget for any new columns before ever adding one. So we disable filtering before changing the columns here.
            this.jqref.jqxGrid({ filterable: false });
            this.jqref.jqxGrid({ columns: this.jqxColumnConfig });
            this.jqref.jqxGrid({ source: this.dataAdapter });
            this.propertyUpdated('allowFiltering');
            this.jqref.jqxGrid('endupdate');
            this.jqref.jqxGrid('refresh');
            this.updateStatusBar();
            this.refreshSelectedColumn();
        }
        deepCloneData() {
            return DEEP_COPY_CONVERTER.deepCopy(this.parsedValue);
        }
        updateData(val) {
            const oldDataLength = this.parsedValue.length;
            const that = this;
            this.parsedValue = val;
            if (this.jqref === undefined) {
                return;
            }
            if (this._refreshRequested) {
                // If we have a pending refresh, no need to update now, the refresh will handle it
                return;
            }
            if (!this._validState) {
                // We might be in an invalid state, even if we have all of our columns and controls,
                // if we don't yet have a value for one of the columns. So here we need to do a refresh
                // to update the jqxValue and re-validate.
                this.refreshIfValid();
                return;
            }
            const changedRows = this.updateJqxValueFromParsedValue();
            if (this.showAggregates && (oldDataLength === 0) !== (this.parsedValue.length === 0)) {
                // If we have any data and didn't before (or the opposite),
                // show or hide the aggregates bar as needed.
                this.updateStatusBar();
            }
            // The jqxGrid updaterow function is noticeably faster than
            // refreshing the data grid via refreshing the data source, so
            // we do that when we can (when the number of rows is the same).
            if (oldDataLength === this.parsedValue.length) {
                const jqxUpdatedValues = changedRows.map(function (row) {
                    return that.jqxValue[row];
                });
                if (jqxUpdatedValues.length > 0) {
                    this.jqref.jqxGrid('updaterow', changedRows, jqxUpdatedValues);
                }
            }
            else {
                this.dataSource.localdata = this.jqxValue;
                this.jqref.jqxGrid({ source: this.dataAdapter });
            }
        }
        findInitialColumns() {
            const childColumns = [];
            const columnItemName = NationalInstruments.HtmlVI.Elements.DataGridColumn.prototype.elementInfo.tagName.toUpperCase();
            let i;
            for (i = 0; i < this.children.length; i++) {
                if (this.children[i].tagName === columnItemName) {
                    childColumns.push(this.children[i]);
                }
            }
            return childColumns;
        }
        sortColumns() {
            this.columns.sort(function (a, b) {
                return a.index - b.index;
            });
        }
        requestRefresh() {
            const that = this;
            if (that._refreshRequested !== true) {
                that._refreshRequested = true;
                window.requestAnimationFrame(function () {
                    that._refreshRequested = false;
                    that.refreshIfValid();
                });
            }
        }
        addColumnListeners(initialColumns) {
            const that = this;
            that.addEventListener('ni-data-grid-column-attached', function (evt) {
                let i, column, observer, observerConfig;
                if (evt.target === that) {
                    column = evt.detail.element;
                    that.columns.push(column);
                    that.sortColumns();
                    observer = new window.MutationObserver(function (mutations) {
                        mutations.forEach(function (mutation) {
                            if (mutation.removedNodes.length > 0) {
                                removeTemplateControlMutationObserver(that, column);
                                that._validState = false; // If we get a value update before our refresh call is handled, this ensures we don't try to update while in an invalid state
                                that.requestRefresh();
                            }
                            if (mutation.addedNodes.length > 0) {
                                addTemplateControlMutationObserver(that, column);
                                that.requestRefresh();
                            }
                        });
                    });
                    observerConfig = { childList: true };
                    column._niColumnObserver = observer;
                    if (typeof observer.observe === 'function') {
                        observer.observe(column, observerConfig);
                    }
                    addTemplateControlMutationObserver(that, column);
                    for (i = 0; i < initialColumns.length; i++) {
                        if (initialColumns[i] === evt.detail.element) {
                            initialColumns.splice(i, 1);
                            break;
                        }
                    }
                    if (initialColumns.length === 0) {
                        if (this.dataSource === undefined) {
                            this.initializeColumnsAndData(); // First time initialization
                        }
                        else {
                            that.requestRefresh();
                        }
                    }
                }
            });
            that.addEventListener('ni-data-grid-column-detached', function (evt) {
                let i, column;
                if (evt.target === that) {
                    column = evt.detail.element;
                    for (i = 0; i < that.columns.length; i++) {
                        if (that.columns[i] === column) {
                            that.columns.splice(i, 1);
                            if (typeof column._niColumnObserver.disconnect === 'function') {
                                column._niColumnObserver.disconnect();
                            }
                            removeTemplateControlMutationObserver(that, column);
                            break;
                        }
                    }
                    // Column removed: No change to our isValid state. It's OK if our value has data for the column
                    // thats going away, the jqxGrid will just ignore that extra data.
                    that.updateColumns();
                }
            });
            that.addEventListener('ni-data-grid-column-changed', function (evt) {
                const propName = evt.detail.propertyName;
                if (propName === 'index') {
                    that.sortColumns();
                }
                if (propName === 'index' || propName === 'fieldName' || !that._isValidState) {
                    that.requestRefresh();
                    return;
                }
                that.updateColumns();
                if (propName === 'aggregates') {
                    that.updateStatusBar();
                    that.updatePageSize();
                }
            });
        }
        updateStatusBar() {
            const that = this;
            const showAddRowsToolBar = (!that.readOnly && that.showAddRowsToolBar);
            let statusBarHeight;
            if (that.addRowsToolbarRef !== undefined) {
                that.addRowsToolbarRef.toggle(showAddRowsToolBar);
            }
            if (that.jqref !== undefined) {
                statusBarHeight = showAddRowsToolBar ? 40 : 0;
                if (this.parsedValue.length > 0 && that.maxAggregateCountPerColumn > 0) {
                    statusBarHeight += that.maxAggregateCountPerColumn * DEFAULT_ROW_HEIGHT + 4;
                }
                // Note: We need to set the statusbarheight before updating the aggregate properties, since
                // it has to already be set before the aggregates render.
                that.jqref.jqxGrid({
                    statusbarheight: statusBarHeight
                });
                that.jqref.jqxGrid({
                    showstatusbar: showAddRowsToolBar || that.showAggregates,
                    showaggregates: that.showAggregates
                });
                if (that.showAggregates) {
                    that.jqref.jqxGrid('renderaggregates');
                }
            }
        }
        updatePageSize() {
            const that = this;
            if (this.updatePageSizeTimer !== undefined) {
                clearTimeout(this.updatePageSizeTimer);
            }
            this.updatePageSizeTimer = setTimeout(function () {
                that.updatePageSizeTimer = undefined;
                if (that.allowPaging) {
                    // Make sure the grid header is rendered before setting paging option
                    if (that.jqref.find('.jqx-grid-header').length === 0) {
                        that.jqref.jqxGrid('render');
                    }
                    let numRows;
                    let height = that.jqref.height();
                    height -= getElementHeight(that.jqref.find('div.jqx-grid-header'));
                    height -= getElementHeight(that.jqref.find('div.jqx-grid-groups-header'));
                    height -= getElementHeight(that.jqref.find('div.jqx-grid-pager'));
                    height -= getElementHeight(that.jqref.find('div.ni-status-bar'));
                    const horizScrollBar = that.jqref.find('div.jqx-scrollbar').sort(function (a, b) {
                        return a.offsetLeft - b.offsetLeft;
                    });
                    height -= getElementHeight(horizScrollBar);
                    numRows = Math.floor(height / that.coercedRowHeight);
                    // Sanity check the number of rows. If the data grid is very small, we can end up computing a negative size since we
                    // subtract the size of toolbars (assuming they're always visible and nonoverlapping).
                    if (numRows <= 0) {
                        numRows = 10;
                    }
                    if (that.pageSize !== numRows && !$.jqx.isHidden(that.jqref)) {
                        that.pageSize = numRows;
                        that.jqref.jqxGrid({ pagesize: numRows, pagesizeoptions: [numRows] });
                    }
                }
            }, 10);
        }
        updatePagingSettings() {
            this.jqref.jqxGrid({ pageable: this.allowPaging });
            const pagerRef = this.jqref.find('div.jqx-grid-pager');
            // Workaround for a jqxGrid issue where the top border of the pager toolbar / a 1px line is still
            // visible when you turn paging on then off
            pagerRef.toggle(this.allowPaging);
            if (this.allowPaging === true) {
                this.addRowsToolbarRef[0].style.bottom = pagerRef.outerHeight() + 'px';
            }
            else {
                this.addRowsToolbarRef[0].style.bottom = '0px';
            }
            this.updatePageSize();
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            if (this.jqref === undefined) {
                return;
            }
            switch (propertyName) {
                case 'rowHeaderVisible':
                    this.jqref.jqxGrid('setcolumnproperty', ID_DATAFIELD, 'hidden', !this.rowHeaderVisible);
                    break;
                case 'columnHeaderVisible':
                    this.jqref.jqxGrid({ showheader: this.columnHeaderVisible });
                    this.updatePageSize();
                    break;
                case 'isInEditMode':
                    this.jqref.jqxGrid({ columnsresize: !this.isInEditMode });
                    if (this._validState) {
                        this.jqref.jqxGrid('render');
                    }
                    break;
                case 'showAddRowsToolBar':
                    this.updateStatusBar();
                    this.updatePageSize();
                    break;
                case 'allowSorting':
                    this.jqref.jqxGrid({ sortable: this.allowSorting });
                    if (!this.allowSorting) {
                        this.jqref.jqxGrid('removesort');
                    }
                    break;
                case 'allowPaging':
                    this.updatePagingSettings();
                    break;
                case 'allowFiltering':
                    this.jqref.jqxGrid({ filterable: this.allowFiltering, showfilterrow: this.allowFiltering });
                    this.updatePageSize();
                    break;
                case 'allowGrouping':
                    this.jqref.jqxGrid({ groupable: this.allowGrouping });
                    this.updatePageSize();
                    break;
                case 'rowHeight':
                    this.updateCoercedRowHeight();
                    this.jqref.jqxGrid({ rowsheight: this.coercedRowHeight });
                    if (this._validState) {
                        this.jqref.jqxGrid('render');
                    }
                    break;
                case 'altRowColors':
                    this.jqref.jqxGrid({ altrows: this.altRowColors });
                    break;
                case 'altRowStart':
                    this.jqref.jqxGrid(getAltRowSettings(this.altRowStart, this.altRowStep));
                    break;
                case 'altRowStep':
                    this.jqref.jqxGrid(getAltRowSettings(this.altRowStart, this.altRowStep));
                    break;
                case 'readOnly':
                    this.jqref.jqxGrid({ editable: !this.disabled && !this.readOnly });
                    this.updateStatusBar();
                    this.updatePageSize();
                    break;
                case 'selectedColumn':
                    this.setSelectedColumn(this.selectedColumn);
                    break;
                case 'niType':
                    this.niTypeInstance = new NIType(this.niType);
                    this.validateState();
                    this.requestRefresh();
                    break;
                case 'disabled':
                    this.jqref.jqxGrid({ disabled: this.disabled, editable: !this.disabled && !this.readOnly });
                    this.setDisabledOnChildElements();
                    this.setDisabledOnAddRowsPane();
                    this.setDisabledOnPagingInput();
                    break;
                default:
                    break;
            }
        }
        setDisabledOnChildElements() {
            const childTemplateElementSelector = 'ni-data-grid-column > *';
            const templateControlsToDisable = this.querySelectorAll(childTemplateElementSelector);
            templateControlsToDisable.forEach(templateControl => {
                templateControl.disabled = this.disabled;
            });
        }
        setDisabledOnAddRowsPane() {
            const elementSelectorToDisable = '.ni-row-count-text-field,.ni-add-rows-button';
            const elementsToDisable = this.querySelectorAll(elementSelectorToDisable);
            elementsToDisable.forEach(element => {
                element.disabled = this.disabled;
            });
        }
        setDisabledOnPagingInput() {
            if (this.allowPaging) {
                const pagerInput = this.querySelectorAll('.jqx-grid-pager-input');
                pagerInput.forEach(input => {
                    input.disabled = this.disabled;
                });
            }
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(DataGrid);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(DataGrid.prototype, 'ni-data-grid', 'HTMLNIDataGrid');
    NationalInstruments.HtmlVI.Elements.DataGrid = DataGrid;
}());
//# sourceMappingURL=ni-data-grid.js.map