"use strict";
(function () {
    'use strict';
    const $ = NationalInstruments.Globals.jQuery;
    NationalInstruments.Controls = NationalInstruments.Controls || {};
    NationalInstruments.Controls.Tree = {};
    NationalInstruments.Controls.Tree.Helpers = {};
    const TREE_HELPERS = NationalInstruments.Controls.Tree.Helpers;
    // Prefix added to user column / field names to not collide with our datafield names (like 'caption'), or internal
    // field names used by JQX (like '_visible').
    const UserColumnDataFieldPrefix = '__';
    const TreeHierarchyPathDelimieter = '\\';
    const DoubleBackslashRegEx = /\\{2,}/;
    /**
     * Given a field name for a user column, gets the datafield name used for the jqxTreeGrid / jqxDataAdapter.
     * Field names coming from user data are prefixed to not collide with datafield names being used by
     * the control internally (like 'caption' or '_visible').
     * @param   {string}   fieldName  The field name coming from the user's data
     * @returns {string}  The corresponding datafield name to use for the JQX control / dataAdapter.
     */
    TREE_HELPERS.getJqxDataFieldName = function (fieldName) {
        return UserColumnDataFieldPrefix + fieldName;
    };
    /**
     * Given a selection and an associated dataSource, verifies that the selection is valid by
     * ensuring that every item in the selection exists within the dataSource directly or can
     * be sanitized to match an item in the dataSource.
     * @param   {string}    pathFieldName   The field on the dataSource items which identifies the record's id.
     * @param   {array}     dataSource      The array of records to check against.
     * @param   {array}     selection       The selection of paths to verify.
     * @returns {array} Returns the array of sanitized, valid paths within the selection or undefined
     * if the selection isn't valid. A path is considered an invalid selection if it either does not
     * exist in the provided dataSource or it otherwise malformed (e.g. contains double blackslashes).
     */
    TREE_HELPERS.ensureValidSelection = function (pathFieldName, dataSource, selection) {
        if (typeof selection === 'string') {
            selection = [selection.trim()];
        }
        if (selection === undefined || selection === null || selection.every(a => a === '')) {
            return [];
        }
        const paths = dataSource.map(r => TREE_HELPERS.sanitizePath(r[pathFieldName]));
        const cleanSelection = selection
            .map(s => TREE_HELPERS.sanitizePath(s))
            .filter(s => s !== undefined && (s === '' || paths.some(p => p && p.startsWith(s))));
        if (cleanSelection.length === selection.length) {
            return cleanSelection;
        }
    };
    /**
     * Determines if a given value is in an acceptable form for conversion and consumption as a dataSource for the tree control.
     * @param   {array}   array   The value to be used as the dataSource.
     * @returns {bool}  Returns true if the supplied value can be properly converted and consumed by the tree control.
     */
    TREE_HELPERS.isValidArrayForTreeDataSource = function (array) {
        if (!Array.isArray(array)) {
            return false;
        }
        return array.length === 0 ||
            array.every(element => {
                if (typeof element !== 'object' || element === null) {
                    return false;
                }
                for (const field in element) {
                    if (element.hasOwnProperty(field) && typeof element[field] !== 'string') {
                        return false;
                    }
                }
                return true;
            });
    };
    /**
     * Converts an array of records into a jqxDataAdapter that is consumable by the tree control's dataSource property.
     * @param   {array}  array  The value to convert.
     * @param   {string} pathFieldName  The fieldName of the path field.
     * @returns {object} An object where 'dataAdapter' is the jqxDataAdapter representing the array, and
     *                   'pathsToIdsMap' is a Map from paths to integer IDs used by the jqxTreeGrid.
     */
    TREE_HELPERS.arrayAsJqxTreeGridSource = function (array, pathFieldName) {
        if (!TREE_HELPERS.isValidArrayForTreeDataSource(array)) {
            throw new TypeError('Invalid array');
        }
        const source = {
            datatype: 'array',
            datafields: [
                { name: 'id', type: 'string' },
                { name: 'parentId', type: 'string' },
                { name: 'caption', type: 'string' },
                { name: 'explicit', type: 'bool' }
            ],
            hierarchy: {
                keyDataField: { name: 'id' },
                parentDataField: { name: 'parentId' }
            },
            id: 'id'
        };
        let dataAdapter;
        // If array is an array, but its length is 0, just return a dataAdapter with nothing in it to save time.
        if (array.length === 0) {
            // eslint-disable-next-line new-cap
            dataAdapter = new $.jqx.dataAdapter(source);
            dataAdapter.columns = [];
            return {
                'dataAdapter': dataAdapter,
                'pathsToIdsMap': new Map()
            };
        }
        const expandedDataSourceAndMap = TREE_HELPERS.expandDataSource(array, pathFieldName);
        // Note that this logic is insufficient in a purely javascript environment. There is no requirement that all elements
        // of an array be objects with similar properties. As such, this would need to take the union of all unique keys in
        // all array elements. However, since we expect the input array to always originate from a strictly typed language
        // where such a assurance does exist, we can go the easy route of basing data fields and columns entirely off of
        // the keys in the first array element.
        const keys = Object.keys(array[0]);
        // This function only works if a hierarchy specifier object exists. Without it, we can't do anything correctly.
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            source.datafields.push({
                name: TREE_HELPERS.getJqxDataFieldName(key),
                type: 'string'
            });
        }
        source.localdata = expandedDataSourceAndMap.dataSource;
        // eslint-disable-next-line new-cap
        dataAdapter = new $.jqx.dataAdapter(source);
        return {
            'dataAdapter': dataAdapter,
            'pathsToIdsMap': expandedDataSourceAndMap.pathsToIdsMap
        };
    };
    /**
     * Strips leading and trailing single backslashes '\' from a tree node's path. If the path contains any
     * errors which render it invalid, (e.g. double backslashes) we reject it as indicated by an undefined return value.
     * @param {string} path The path to sanitize.
     * @returns {string} Returns either the sanitized path or undefined if it could not be sanitized.
     */
    TREE_HELPERS.sanitizePath = function (path) {
        // Double backslash '\\' is reserved as a special character. For now, we will reject any record
        // whose path contains a double backslash anywhere within it.
        path = path && path.trim();
        if (path === undefined || path === '' || DoubleBackslashRegEx.test(path) === true) {
            return;
        }
        return path.replace(/^\\|\\$/g, '');
    };
    /**
     * Expands an array of tree records whose paths point to non-contiguous nodes into an array of tree records wherein each record represents a node in the actual tree.
     * @param   {array} dataSource   The data source that should be expanded.
     * @param   {array} pathFieldName   The field name for the Path field.
     * @returns {object} An object where 'dataSource' is an updated dataSource but with duplicates removed and subsequent, implicit
     *                   records included, and 'pathsToIdsMap' is a Map from paths to integer IDs which are used by
     *                   the jqxTreeGrid.
     */
    TREE_HELPERS.expandDataSource = function (dataSource, pathFieldName) {
        const RootPath = '';
        const pathsToIds = new Map();
        pathsToIds.set(RootPath, 0);
        let currentId = 1;
        const expandExplicitRecord = function (explicitRecord, expandedRecords) {
            const explicitRecordPath = TREE_HELPERS.sanitizePath(explicitRecord[pathFieldName]);
            if (explicitRecordPath === undefined) {
                return;
            }
            const tokens = explicitRecordPath.split(TreeHierarchyPathDelimieter);
            let parentId = RootPath;
            for (let i = 0; i < tokens.length; i++) {
                const explicit = i === tokens.length - 1;
                const recordPath = tokens.slice(0, i + 1).join(TreeHierarchyPathDelimieter);
                if (!pathsToIds.has(recordPath)) {
                    pathsToIds.set(recordPath, currentId++);
                }
                const child = {
                    id: pathsToIds.get(recordPath),
                    parentId: pathsToIds.get(parentId),
                    caption: tokens[i],
                    explicit: explicit,
                    explicitPath: explicitRecordPath
                };
                parentId = recordPath;
                if (explicit) {
                    const keys = Object.keys(explicitRecord);
                    for (let j = 0; j < keys.length; j++) {
                        child[TREE_HELPERS.getJqxDataFieldName(keys[j])] = explicitRecord[keys[j]];
                    }
                }
                child[TREE_HELPERS.getJqxDataFieldName(pathFieldName)] = recordPath;
                const existingRecord = expandedRecords.get(recordPath);
                if (existingRecord === undefined || (!existingRecord.explicit && child.explicit)) {
                    expandedRecords.set(recordPath, child);
                }
            }
        };
        const expandedDataSource = new Map();
        dataSource.forEach(explicitNode => {
            expandExplicitRecord(explicitNode, expandedDataSource);
        });
        return {
            'dataSource': Array.from(expandedDataSource.values()),
            'pathsToIdsMap': pathsToIds
        };
    };
    /**
     * Gets the first element of a cluster within a 1D array type which is used by the ni-tree as the field
     * which identifies that path to a record in the hierarchy.
     * @param {niType} type The niType that the ni-tree uses as its dataSource's type.
     */
    TREE_HELPERS.getPathSpecifierForType = function (type) {
        if (type === undefined || !type.isArray() || !type.getSubtype().isCluster()) {
            return undefined;
        }
        return type.getSubtype().getFields()[0];
    };
    /**
     * Gets a default record object for the tree type given.
     * @param {NIType}  type    The tree type for which to get the default record value.
     * @returns {object}    Returns an object with default values for every key in the trees record type.
     */
    TREE_HELPERS.getDefaultRecordForType = function (type) {
        const fields = type.getSubtype().getFields();
        const defaultElementValue = {};
        fields.forEach(field => {
            defaultElementValue[field] = '';
        });
        return defaultElementValue;
    };
    /**
     * Gets the records associated with a list of paths.
     * @param {NIType}  type    The NIType of the tree the records are associated with.
     * @param {array}   records The list of records within which to search.
     * @param {array}   paths   The list of paths identifying the records.
     * @returns {array} Returns the list of records associated with the supplied paths.
     */
    TREE_HELPERS.getRecordsFromPaths = function (type, records, paths) {
        const pathFieldName = TREE_HELPERS.getPathSpecifierForType(type);
        return paths.map(path => {
            const sanitizedPath = TREE_HELPERS.sanitizePath(path);
            const record = records.find(record => TREE_HELPERS.sanitizePath(record[pathFieldName]) === sanitizedPath);
            return Object.assign(TREE_HELPERS.getDefaultRecordForType(type), record, { [pathFieldName]: sanitizedPath });
        });
    };
}());
//# sourceMappingURL=jqxtreehelpers.js.map