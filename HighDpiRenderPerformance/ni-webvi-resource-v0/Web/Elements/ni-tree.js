"use strict";
//****************************************
// Tree Control
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    const $ = NationalInstruments.Globals.jQuery;
    const TREE_HELPER = NationalInstruments.Controls.Tree.Helpers;
    const TreeSelectionMode = NationalInstruments.HtmlVI.TreeStates.SelectionModeEnum;
    const TreeValueConverter = NationalInstruments.HtmlVI.ValueConverters.TreeValueConverter;
    const DEEP_COPY_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.DeepCopyValueConverter;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const selectTextInElement = function (element) {
        const newRange = document.createRange();
        newRange.selectNodeContents(element);
        const docSelection = window.getSelection();
        docSelection.removeAllRanges();
        docSelection.addRange(newRange);
    };
    const isValidNIType = function (type) {
        return type !== undefined &&
            type.isArray() &&
            type.getSubtype().isCluster() &&
            type.getSubtype().getSubtype().every(t => t.getName() === window.NITypeNames.STRING);
    };
    const defaultColumnWidth = 100;
    const defaultColumnHeader = ' ';
    const ArrowKeyCodes = Object.freeze({
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    });
    JQX('ni-tree', class Tree extends JQX.BaseElement {
        // Tree's properties.
        static get properties() {
            return {
                'allowSelection': {
                    value: false,
                    type: 'boolean',
                    observer: '_allowSelectionChangeHandler'
                },
                'selectionMode': {
                    value: TreeSelectionMode.SINGLE,
                    type: 'string',
                    observer: '_selectionModeChangeHandler'
                },
                'columnHeaders': {
                    value: [],
                    type: 'array',
                    validator: '_columnHeadersValidator',
                    observer: '_columnHeadersChangeHandler'
                },
                'columnHeaderVisible': {
                    value: false,
                    type: 'boolean',
                    observer: '_columnHeaderVisibleChangeHandler'
                },
                'columnWidths': {
                    value: [],
                    type: 'array',
                    observer: '_columnWidthsChangeHandler'
                },
                'dataSource': {
                    value: [],
                    /* Using type=any avoids expensive JSON.stringify value comparisons for
                       array values in jqxelement. */
                    type: 'any',
                    notify: true,
                    reflectToAttribute: false,
                    validator: '_dataSourceValidator',
                    observer: '_dataSourceChangeHandler'
                },
                'niType': {
                    value: '',
                    type: 'string',
                    observer: '_niTypeChangeHandler'
                },
                'selectedData': {
                    value: [],
                    readOnly: true,
                    type: 'array'
                },
                'selection': {
                    value: [],
                    type: 'array'
                }
            };
        }
        /** Tree's event listeners. */
        static get listeners() {
            return {
                'resize': '_resizeHandler'
            };
        }
        /** Tree's Html template. */
        template() {
            return `<div style='width: 100%; height: 100%'></div>`;
        }
        /** Called when the element is ready. Used for one-time configuration of the Tree. */
        ready() {
            const that = this;
            super.ready();
            // Initialize jqx-treegrid
            that.childDiv = that.firstElementChild;
            that.jqref = $(that.childDiv);
            that.jqref.jqxTreeGrid({
                width: '100%',
                height: '100%',
                pageable: false,
                altRows: true,
                autoRowHeight: false,
                enableBrowserSelection: true,
                columnsResize: true,
                touchMode: false,
                selectionMode: TreeValueConverter.convertNIToJQXSelectionMode(that.selectionMode),
                showHeader: that.columnHeaderVisible,
                localization: { emptydatastring: '' },
                handleKeyboardNavigation: function (key) {
                    if (!that.allowSelection && (key === ArrowKeyCodes.UP || key === ArrowKeyCodes.DOWN || key === ArrowKeyCodes.LEFT || key === ArrowKeyCodes.RIGHT)) {
                        return true; // Disallow arrow keys to select rows unless Allow Selection is on
                    }
                }
            });
            that._lastSelection = [];
            that.jqref.jqxTreeGrid('rendered', function () {
                that._restoreScrollPositionDuringUpdate();
            });
            that._pathsToIdsMap = new Map();
            that._columnHeadersChangeHandler(undefined, that.columnHeaders);
            that._niTypeChangeHandler(undefined, that.niType);
            that._setDataSource(that.dataSource);
            // Register for events
            that._expandedParents = new Set();
            that.jqref.on('bindingComplete', e => {
                that._refreshFolding();
            });
            that.jqref.on('rowExpand', e => that._rowExpansionChangeHandler(e));
            that.jqref.on('rowCollapse', e => that._rowExpansionChangeHandler(e));
            that.jqref.on('rowSelect', e => that._interactiveSelectionChangeHandler(e));
            that.jqref.on('rowUnselect', e => that._interactiveSelectionChangeHandler(e));
            that.jqref.on('rowDoubleClick', (e) => {
                // jqxTreeGrid doesn't allow text selection via doubleclick, and raises its own event for it.
                // Instead of doubleclick doing nothing, we go ahead and select cell text in that case.
                if (!that.allowSelection) {
                    selectTextInElement(e.args.originalEvent.target);
                }
            });
            that.addEventListener('keydown', function (evt) {
                if (that.jqref !== undefined && that.allowSelection && that.selection.length === 0 &&
                    that._dataSourceAdapter !== undefined && that._dataSourceAdapter.records.length > 0 &&
                    evt.key && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown' || evt.key === 'Up' || evt.Key === 'Down')) {
                    that.selectionIsChanging = true;
                    that.jqref.jqxTreeGrid('selectRow', that._dataSourceAdapter.records[0].id);
                    delete that.selectionIsChanging;
                }
                // Limit Ctrl-A within tree to only select table cell text (vs. everything on the page, if the tree is on a page with other controls)
                if ((evt.ctrlKey || evt.metaKey) && evt.key && evt.key.toLowerCase() === 'a' &&
                    that.jqref.jqxTreeGrid('selectionMode') !== TreeValueConverter.convertNIToJQXSelectionMode(TreeSelectionMode.MULTIPLE)) {
                    const table = that.querySelector('table');
                    if (table !== null) {
                        selectTextInElement(table);
                        evt.preventDefault();
                    }
                }
            });
            that.addEventListener('focus', function (e) {
                if (e.target === that) {
                    that.childDiv.focus();
                    if (e.cancelable) {
                        e.preventDefault();
                    }
                }
            });
            // Prevent right-click from being used to scroll or resize columns
            const stopRightClickPropagation = function (evt) {
                if (evt.button === 2) {
                    evt.stopPropagation();
                }
            };
            that.addEventListener('mousedown', stopRightClickPropagation, true);
            that.addEventListener('mouseup', stopRightClickPropagation, true);
            that.updateColumnsHeight();
            that.jqref.on('columnResized', e => that._columnResizeHandler(e));
        }
        focusAndAllowKeyboardNavigation() {
            this._alwaysAllowKeyboardNavigationWhenFocused = true;
            this.childDiv.focus();
        }
        _allowSelectionChangeHandler(oldValue, newValue) {
            this.jqref.jqxTreeGrid({ selectionMode: TreeValueConverter.convertNIToJQXSelectionMode(this.selectionMode) });
            if (newValue === false) {
                this.clearSelection();
            }
        }
        _selectionModeChangeHandler(oldValue, newValue) {
            this.jqref.jqxTreeGrid({ selectionMode: TreeValueConverter.convertNIToJQXSelectionMode(newValue) });
            if (this.selection.length !== 0 && newValue === TreeSelectionMode.SINGLE) {
                this.selection = [this.selection[0]];
            }
        }
        _columnHeadersChangeHandler(oldValue, newValue) {
            this._updateColumns();
        }
        _columnHeadersValidator(oldValue, newValue) {
            return newValue.map(header => header !== undefined && header.length > 0 ? header : defaultColumnHeader);
        }
        _columnHeaderVisibleChangeHandler(oldValue, newValue) {
            this._updateTreeAndPreserveSelectionAndScrollOffset(() => {
                this.jqref.jqxTreeGrid({ showHeader: newValue });
                this.jqref.jqxTreeGrid('render');
            });
        }
        _columnWidthsChangeHandler(oldValue, newValue) {
            this._columnWidths = newValue;
            this._updateColumns();
        }
        _dataSourceChangeHandler(oldValue, newValue) {
            if (!DEEP_COPY_CONVERTER.isDeepEqual(oldValue, newValue)) {
                this._setDataSource(newValue);
            }
        }
        _niTypeChangeHandler(oldValue, newValue) {
            this._niTypeInstance = newValue !== '' ? new window.NIType(newValue) : undefined;
            if (isValidNIType(this._niTypeInstance)) {
                this._updateColumns();
                const pathFieldName = TREE_HELPER.getPathSpecifierForType(this._niTypeInstance);
                const dataSourceNeedsUpdate = this._dataSourceAdapter !== undefined;
                this._pathFieldName = pathFieldName;
                this._pathDataFieldName = TREE_HELPER.getJqxDataFieldName(pathFieldName);
                if (dataSourceNeedsUpdate) {
                    this._setDataSource(this.dataSource);
                }
            }
        }
        // We need to keep columnsHeight up to date based on font size, since it affects table and scrollbar layout inside the jqxTreeGrid
        updateColumnsHeight() {
            const columnsHeight = parseInt(window.getComputedStyle(this.querySelector('div.jqx-grid-header')).height, 10);
            this.jqref.jqxTreeGrid({ 'columnsHeight': columnsHeight });
        }
        collapse(path) {
            this._safeChangeFolding(() => {
                path = TREE_HELPER.sanitizePath(path);
                const id = this._pathsToIdsMap.get(path);
                this._safeCallJqxTreeGridMethod('collapseRow', id);
                let deleted = false;
                this._expandedParents.forEach(p => {
                    if (p.startsWith(path)) {
                        deleted |= this._expandedParents.delete(p);
                    }
                });
                const parent = path.substring(0, path.lastIndexOf('\\'));
                if (deleted && parent !== "" && parent !== undefined) {
                    this._expandedParents.add(parent);
                }
            }, /* notify */ false);
        }
        collapseAll() {
            this._safeChangeFolding(() => {
                this._safeCallJqxTreeGridMethod('collapseAll');
                this._expandedParents.clear();
            }, /* notify */ false);
        }
        expand(path) {
            this._safeChangeFolding(() => {
                const id = this._pathsToIdsMap.get(path);
                this._expandSubtreeToChild(id, /* inclusive */ true);
                this._expandedParents.add(path);
            }, /* notify */ false);
        }
        expandAll() {
            this._safeChangeFolding(() => {
                this._safeCallJqxTreeGridMethod('expandAll');
                this._expandedParents = new Set(this.dataSource.map(r => r[this._pathFieldName]));
            }, /* notify */ false);
        }
        _safeChangeFolding(action, notify) {
            const nested = this.updating;
            if (!nested) {
                this.jqref.jqxTreeGrid('beginUpdate');
            }
            action();
            if (!nested) {
                this.jqref.jqxTreeGrid('endUpdate');
            }
            if (notify) {
                this._notifyFoldingChanged();
            }
        }
        get columnWidths() {
            return this._columnWidths || ['auto'];
        }
        set columnWidths(value) {
            const oldWidths = this._columnWidths || [];
            const newWidths = value || [];
            if (!DEEP_COPY_CONVERTER.isDeepEqual(oldWidths !== newWidths)) {
                this._columnWidths = newWidths;
                this._updateColumns();
            }
        }
        get selectedData() {
            return this._niTypeInstance !== undefined ? TREE_HELPER.getRecordsFromPaths(this._niTypeInstance, this.dataSource, this.selection) : [];
        }
        get selection() {
            let selection;
            if (this.jqref !== undefined) {
                selection = this.jqref.jqxTreeGrid('getSelection');
            }
            if (this.allowSelection) {
                if (selection !== undefined && selection.length > 0) {
                    return selection.filter(path => path !== undefined).map(row => row && row[this._pathDataFieldName]);
                }
            }
            return [];
        }
        set selection(value) {
            value = TREE_HELPER.ensureValidSelection(this._pathFieldName, this.dataSource, value) || [];
            if (this.jqref !== undefined) {
                const selection = this.jqref.jqxTreeGrid('getSelection');
                const currentSelectedIds = selection.filter(row => row !== undefined).map(row => row.id);
                const newSelectedIds = value.map(path => {
                    const id = this._pathsToIdsMap.get(path);
                    return id !== undefined ? id.toString() : undefined;
                }).filter(id => id !== undefined);
                if (!DEEP_COPY_CONVERTER.isDeepEqual(currentSelectedIds.sort(), newSelectedIds.sort())) {
                    this.selectionIsChanging = true;
                    this.jqref.jqxTreeGrid('clearSelection');
                    if (this.allowSelection) {
                        value.forEach(path => {
                            const id = this._pathsToIdsMap.get(path);
                            this.jqref.jqxTreeGrid('selectRow', id);
                            this._expandSubtreeToChild(id);
                        });
                    }
                    delete this.selectionIsChanging;
                }
            }
            this._requestedSelection = value;
        }
        clearSelection() {
            this.selection = [];
        }
        // Private Helpers
        _updateColumns() {
            if (this._niTypeInstance === undefined) {
                return;
            }
            this._safeCallJqxTreeGridMethod('beginUpdate');
            const columnDataFields = this._niTypeInstance.getSubtype().getFields();
            const numColumns = columnDataFields.length;
            const widths = [...this.columnWidths.slice(0, numColumns), ...Array(Math.max(0, numColumns - this.columnWidths.length)).fill(defaultColumnWidth)];
            const headers = [...this.columnHeaders.slice(0, numColumns), ...Array(Math.max(0, numColumns - this.columnHeaders.length)).fill(defaultColumnHeader)];
            const newColumns = [];
            const fieldNames = this._niTypeInstance.getSubtype().getFields();
            this._columnDataFields = [];
            for (let i = 0; i < fieldNames.length; i++) {
                const dataField = i === 0 ? 'caption' : TREE_HELPER.getJqxDataFieldName(fieldNames[i]);
                const newValues = {
                    text: headers[i],
                    width: widths[i],
                    datafield: dataField,
                    renderer: function (text, align, headerheight) {
                        return '<div style="overflow: hidden; text-overflow: ellipsis; text-align: ' + align + '; margin: 4px;">' + '<span style="text-overflow: ellipsis; cursor: default;">' + NI_SUPPORT.escapeHtml(text) + '</span>' + '</div>';
                    }
                };
                this._columnDataFields.push(dataField);
                newColumns.push(newValues);
            }
            this._updateTreeAndPreserveSelectionAndScrollOffset(() => {
                this.jqref.jqxTreeGrid({ columns: newColumns });
            });
            this._safeCallJqxTreeGridMethod('endUpdate');
        }
        _dataSourceValidator(oldValue, newValue) {
            if (typeof newValue === 'string' && this.properties['dataSource'].isUpdatingFromAttribute) {
                try {
                    newValue = JSON.parse(newValue);
                }
                catch (e) {
                    // Invalid attribute value, fallback to previous (default) value
                    return oldValue;
                }
            }
            if (TREE_HELPER.isValidArrayForTreeDataSource(newValue)) {
                return newValue;
            }
            return oldValue;
        }
        _setDataSource(array) {
            if (array !== undefined && this._pathFieldName !== undefined) {
                let oldRowCount = 0;
                const oldDataAdapter = this._dataSourceAdapter;
                if (oldDataAdapter !== undefined) {
                    oldRowCount = oldDataAdapter.records.length;
                }
                const dataAdapterAndMap = TREE_HELPER.arrayAsJqxTreeGridSource(array, this._pathFieldName);
                const dataAdapter = dataAdapterAndMap.dataAdapter;
                let newRowCount = 0;
                if (dataAdapter._source.localdata !== undefined) {
                    newRowCount = dataAdapter._source.localdata.length;
                }
                let fullUpdate = oldRowCount === 0 || oldRowCount !== newRowCount;
                if (!fullUpdate) {
                    // Ensure paths are identical (and in the same order and count) across old and new data.
                    // Otherwise, we need do a full refresh which is much more expensive (10x slower).
                    let i;
                    for (i = 0; i < newRowCount; i++) {
                        if (oldDataAdapter.records[i][this._pathDataFieldName] !== dataAdapter._source.localdata[i][this._pathDataFieldName]) {
                            break;
                        }
                    }
                    if (i === newRowCount) {
                        for (i = 0; i < newRowCount; i++) {
                            const oldRowData = oldDataAdapter.records[i];
                            const rowData = dataAdapter._source.localdata[i];
                            if (!DEEP_COPY_CONVERTER.isDeepEqual(oldRowData, rowData)) {
                                const hierarchyRowData = this.jqref.jqxTreeGrid('getRow', rowData.id);
                                for (let j = 1; j < this._columnDataFields.length; j++) {
                                    const curDataField = this._columnDataFields[j];
                                    oldRowData[curDataField] = rowData[curDataField];
                                    hierarchyRowData[curDataField] = rowData[curDataField];
                                }
                            }
                        }
                        this.jqref.jqxTreeGrid('_renderrows');
                    }
                    else {
                        fullUpdate = true;
                    }
                }
                if (fullUpdate) {
                    this._updateTreeAndPreserveSelectionAndScrollOffset(() => {
                        this._pathsToIdsMap = dataAdapterAndMap.pathsToIdsMap;
                        this._dataSourceAdapter = dataAdapter;
                        this.jqref.jqxTreeGrid({ source: dataAdapter });
                    });
                }
            }
        }
        _updateTreeAndPreserveSelectionAndScrollOffset(updateAction) {
            const oldSelection = this.selection;
            const table = this.querySelector('table');
            if (table !== null) {
                // The jqxTreeGrid's scrolling works by having the contentTable be position=relative,
                // and setting left and top offsets. We restore these offsets just after the table
                // HTML is updated in the DOM (see the 'rendered' callback). This prevents some
                // flickering if we'd just restored scroll offset via the scrollOffset function (by the
                // time we can call that, we would've already rendered at the wrong scroll position).
                const contentTable = table.parentElement;
                const topOffset = parseFloat(contentTable.style.top);
                const leftOffset = parseFloat(contentTable.style.left);
                this._tableScrollOffset = {};
                if (!window.isNaN(topOffset)) {
                    this._tableScrollOffset.top = topOffset;
                }
                if (!window.isNaN(leftOffset)) {
                    this._tableScrollOffset.left = leftOffset;
                }
            }
            else {
                this._tableScrollOffset = undefined;
            }
            const scrollOffset = this.jqref.jqxTreeGrid('scrollOffset');
            updateAction();
            this.selection = oldSelection;
            this.jqref.jqxTreeGrid('scrollOffset', scrollOffset.top, scrollOffset.left);
            this._tableScrollOffset = undefined;
        }
        _restoreScrollPositionDuringUpdate() {
            if (this._tableScrollOffset !== undefined) {
                const table = this.querySelector('table');
                if (table !== null) {
                    if (this._tableScrollOffset.top !== undefined) {
                        table.parentElement.style.top = this._tableScrollOffset.top + 'px';
                    }
                    if (this._tableScrollOffset.left !== undefined) {
                        table.parentElement.style.left = this._tableScrollOffset.left + 'px';
                    }
                }
            }
        }
        _resizeHandler() {
            if (this.jqref !== undefined) {
                this.jqref.jqxTreeGrid({ width: this.offsetWidth, height: this.offsetHeight });
            }
        }
        _columnResizeHandler(e) {
            const columns = this.jqref.jqxTreeGrid('columns');
            const columnIndex = columns.records.findIndex(c => c.datafield === e.args.dataField);
            if (columnIndex >= 0) {
                const numColumns = columns.length();
                const widths = [...this.columnWidths, ...Array(Math.max(0, numColumns - this.columnWidths.length)).fill(defaultColumnWidth)];
                widths[columnIndex] = e.args.newWidth;
                this._columnWidths = widths;
                this.dispatchEvent(new CustomEvent('columnsResized', {
                    detail: {
                        newWidths: this._columnWidths
                    }
                }));
            }
        }
        _interactiveSelectionChangeHandler(e) {
            const that = this;
            if (that.selectionIsChanging !== true) {
                if (e.args.reason === 'clearingSelection') {
                    return;
                }
                if (!this.allowSelection) {
                    // if users can't select, we need to wipe out the selection JQX just made.
                    this.jqref.jqxTreeGrid('clearSelection');
                    return;
                }
                if (!DEEP_COPY_CONVERTER.isDeepEqual(that.selection, that._lastSelection)) {
                    that.dispatchEvent(new CustomEvent('selectionChange', {
                        detail: {
                            newSelection: that.selection,
                            oldSelection: that._lastSelection,
                            selectedData: that.selectedData
                        }
                    }));
                    // CAR 725050 will refactor the get/set selection.  As such, I can't use the internal _requestedSelection
                    // so I'm adding this temporary cached last selection value.
                    that._lastSelection = that.selection;
                }
            }
        }
        _refreshFolding() {
            this.foldingIsChanging = true;
            this.jqref.jqxTreeGrid('collapseAll');
            this._expandedParents.forEach(path => {
                const rowId = this._pathsToIdsMap.get(path);
                if (rowId !== undefined) {
                    this.jqref.jqxTreeGrid('expandRow', rowId);
                    this._expandSubtreeToChild(rowId);
                }
            });
            delete this.foldingIsChanging;
        }
        _rowExpansionChangeHandler(e) {
            const changeType = e.type;
            const row = e.args.row;
            if (changeType === 'rowExpand') {
                this._expandedParents.add(row[this._pathDataFieldName]);
            }
            else {
                this._expandedParents.delete(row[this._pathDataFieldName]);
            }
            if (!this.foldingIsChanging) {
                this._notifyFoldingChanged(changeType, row[this._pathDataFieldName]);
            }
        }
        _notifyFoldingChanged(changeType, path) {
            const detail = {
                newFolding: Array.from(this._expandedParents),
                changeType: changeType || "programmatic"
            };
            if (detail.changeType !== "programmatic") {
                detail.path = path;
                detail.data = TREE_HELPER.getRecordsFromPaths(this._niTypeInstance, this.dataSource, [path])[0];
            }
            this.dispatchEvent(new CustomEvent('foldingChanged', { detail: detail }));
        }
        _traverseParentsToRoot(row, action) {
            let node = row;
            while (node !== undefined && node.parent !== null) {
                action(node.parent);
                node = node.parent;
            }
        }
        _traverseSubtreenDepthFirst(row, action) {
            const node = row;
            const children = node.records;
            children && children.forEach(n => this._traverseSubtreenDepthFirst(n, action));
            action(node);
        }
        _expandSubtreeToChild(id, inclusive) {
            if (this.jqref === undefined || id === undefined) {
                return;
            }
            let node = this.jqref.jqxTreeGrid('getRow', id);
            if (inclusive !== true) {
                node = node.parent;
            }
            while (node !== undefined && node !== null) {
                this.jqref.jqxTreeGrid('expandRow', node.id);
                node = node.parent;
            }
        }
        _safeCallJqxTreeGridMethod(method, param) {
            if (this.jqref !== undefined) {
                return this.jqref.jqxTreeGrid(method, param);
            }
        }
        propertyChangedHandler(propertyName, oldValue, newValue) {
            super.propertyChangedHandler(propertyName, oldValue, newValue);
            const that = this;
            switch (propertyName) {
                case 'disabled':
                    that.jqref.jqxTreeGrid('disabled', that.disabled);
                    break;
                default:
                    break;
            }
        }
    });
}());
//# sourceMappingURL=ni-tree.js.map