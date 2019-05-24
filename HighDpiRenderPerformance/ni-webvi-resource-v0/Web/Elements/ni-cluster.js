"use strict";
//**************************************
//Cluster Control Prototype
// DOM Registration: No
//National Instruments Copyright 2014
//**************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const NI_VAL_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.ElementValueConverter;
    const DEEP_COPY_CONVERTER = NationalInstruments.HtmlVI.ValueConverters.DeepCopyValueConverter;
    const NIType = window.NIType;
    // Static Private Functions
    const getElementValue = function (element, propertyName) {
        const value = element[propertyName], convertedValue = NI_VAL_CONVERTER.convertBack(element, value);
        return convertedValue;
    };
    const setElementValue = function (element, propertyName, value) {
        const convertedValue = NI_VAL_CONVERTER.convert(element, value);
        element[propertyName] = convertedValue;
    };
    const parseInitialValue = function (attributeValue) {
        let result = {}, parsedVal;
        if (attributeValue !== null) {
            try {
                parsedVal = JSON.parse(attributeValue);
                if (typeof parsedVal === 'object' && parsedVal !== null) {
                    result = parsedVal;
                }
            }
            catch (e) {
                // If the attribute valid is invalid, we don't want to throw, just fallback to a default
            }
        }
        return result;
    };
    const createChildCache = function (cluster) {
        let controlMetaById = {};
        let labelMetaByText = {};
        let labelMetaById = {};
        const createLabelMeta = function (labelElement, controlMeta) {
            return {
                labelElement: labelElement,
                controlMeta: controlMeta
            };
        };
        const createControlMeta = function (controlElement) {
            return {
                controlElement: controlElement,
                listener: undefined
            };
        };
        const getChildByFieldName = function (fieldName) {
            const labelMeta = labelMetaByText[fieldName];
            if (labelMeta === undefined) {
                return undefined;
            }
            if (labelMeta.controlMeta === undefined) {
                return undefined;
            }
            // controlMeta.controlElement should never be undefined
            return labelMeta.controlMeta.controlElement;
        };
        // The cache is valid if all of the type field names correspond to elements and cluster values
        const checkCacheIsValid = function () {
            if (cluster._niTypeInstance === undefined) {
                return false;
            }
            const fields = cluster._niTypeInstance.getFields();
            let i, currField, currLabelMeta, currControlElement;
            for (i = 0; i < fields.length; i++) {
                currField = fields[i];
                currLabelMeta = labelMetaByText[currField];
                if (currLabelMeta === undefined || currLabelMeta.controlMeta === undefined) {
                    NI_SUPPORT.infoVerbose('Cluster (' + cluster.niControlId + ') has invalid cache: either label or control missing for field: ' + currField);
                    return false;
                }
                currControlElement = currLabelMeta.controlMeta.controlElement;
                if (currControlElement.parentElement !== cluster) {
                    NI_SUPPORT.infoVerbose('Cluster (' + cluster.niControlId + ') has invalid cache: child control (' + currControlElement.niControlId + ') not attached for field: ' + currField);
                    return false;
                }
                if (cluster._clusterValue[currField] === undefined) {
                    NI_SUPPORT.infoVerbose('Cluster (' + cluster.niControlId + ') has invalid cache: cluster value missing for field: ' + currField);
                    return false;
                }
            }
            return true;
        };
        // Assumes no listeners currently registered and registers all elements associated with a field name
        const addChildListeners = function () {
            const fields = cluster._niTypeInstance.getFields();
            let i, controlMeta;
            for (i = 0; i < fields.length; i++) {
                controlMeta = labelMetaByText[fields[i]].controlMeta;
                controlMeta.listener = cluster.childChanged.bind(cluster, controlMeta.controlElement);
                // Prevent multiple events of the same name but from different children from triggering by registering on the child element
                // TODO mraj Since we don't care which child triggered the message it may be more efficient to dedupe the listeners and place them on the cluster directly
                controlMeta.controlElement.addEventListener(controlMeta.controlElement.valuePropertyDescriptor.eventName, controlMeta.listener);
            }
        };
        // Unregisters all existing listeners. Searches entire cache as fields may have changed due to type change
        const removeChildListeners = function () {
            let currControlId, controlMeta;
            for (currControlId in controlMetaById) {
                if (controlMetaById.hasOwnProperty(currControlId)) {
                    controlMeta = controlMetaById[currControlId];
                    if (controlMeta.listener !== undefined) {
                        controlMeta.controlElement.removeEventListener(controlMeta.controlElement.valuePropertyDescriptor.eventName, controlMeta.listener);
                        controlMeta.listener = undefined;
                    }
                }
            }
        };
        const updateCacheIfNeededAndValidate = function () {
            let cacheIsValid = checkCacheIsValid();
            if (cacheIsValid) {
                return true;
            }
            removeChildListeners();
            controlMetaById = {};
            labelMetaByText = {};
            labelMetaById = {};
            let i = 0;
            let labelMeta, controlMeta, currChild;
            for (i = 0; i < cluster.childNodes.length; i++) {
                currChild = cluster.childNodes[i];
                // Ignore extraneous non element nodes
                if (currChild.labelId !== undefined) {
                    if (currChild.labelId === '') {
                        // currChild is a label
                        labelMeta = labelMetaById[currChild.niControlId];
                        if (labelMeta === undefined) {
                            labelMeta = createLabelMeta(currChild, undefined);
                            labelMetaById[currChild.niControlId] = labelMeta;
                        }
                        else {
                            labelMeta.labelElement = currChild;
                        }
                        labelMetaByText[currChild.text] = labelMeta;
                    }
                    else {
                        // currChild is a control
                        controlMeta = createControlMeta(currChild);
                        controlMetaById[currChild.niControlId] = controlMeta;
                        labelMeta = labelMetaById[currChild.labelId];
                        if (labelMeta === undefined) {
                            labelMeta = createLabelMeta(undefined, controlMeta);
                            labelMetaById[currChild.labelId] = labelMeta;
                        }
                        else {
                            labelMeta.controlMeta = controlMeta;
                        }
                    }
                }
            }
            // Since we iterate through all direct children it is possible the cache has elements not associated
            // with a field name. For validity all we care about is that the fields of the type correspond
            // to an element; extra fields are ignored in terms of validity, child event listeners, value, etc.
            cacheIsValid = checkCacheIsValid();
            if (cacheIsValid) {
                addChildListeners();
                return true;
            }
            // the cache is not valid so dump collected elements
            controlMetaById = {};
            labelMetaByText = {};
            labelMetaById = {};
            return false;
        };
        return {
            updateCacheIfNeededAndValidate: updateCacheIfNeededAndValidate,
            getChildByFieldName: getChildByFieldName
        };
    };
    class Cluster extends NationalInstruments.HtmlVI.Elements.LayoutControl {
        // Static Private Variables
        // None
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = Cluster.prototype;
            Object.defineProperty(proto, 'value', {
                get: function () {
                    return DEEP_COPY_CONVERTER.deepCopy(this._clusterValue);
                },
                set: function (newValue) {
                    const oldValue = this._clusterValue;
                    if (DEEP_COPY_CONVERTER.isDeepEqual(oldValue, newValue)) {
                        return;
                    }
                    this._clusterValue = DEEP_COPY_CONVERTER.deepCopy(newValue);
                    this.dispatchEvent(new CustomEvent('value-changed', {
                        bubbles: true,
                        cancelable: false,
                        detail: {
                            newValue: newValue,
                            oldValue: oldValue // Pass internal value directly to the event. We already replaced internal value with a copy.
                        }
                    }));
                    if (this._childValueChanging === false) {
                        this.updateChildValues();
                    }
                },
                configurable: false,
                enumerable: true
            });
            Object.defineProperty(proto, 'valueNonSignaling', {
                get: function () {
                    return DEEP_COPY_CONVERTER.deepCopy(this._clusterValue);
                },
                set: function (newValue) {
                    if (DEEP_COPY_CONVERTER.isDeepEqual(this._clusterValue, newValue)) {
                        return;
                    }
                    this._clusterValue = DEEP_COPY_CONVERTER.deepCopy(newValue);
                    if (this._childValueChanging === false) {
                        this.updateChildValues();
                    }
                },
                configurable: false,
                enumerable: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'niType',
                defaultValue: '{"name":"Cluster","fields":[],"subtype":[]}'
            });
            NI_SUPPORT.setValuePropertyDescriptor(targetPrototype, 'value', 'value', 'valueNonSignaling', 'value-changed');
        }
        makeValueObj() {
            const fields = this._niTypeInstance.getFields();
            const valueObj = {};
            let i, currChild, currField;
            for (i = 0; i < fields.length; i++) {
                currField = fields[i];
                currChild = this._childCache.getChildByFieldName(currField);
                valueObj[currField] = getElementValue(currChild, currChild.valuePropertyDescriptor.propertyName);
            }
            return valueObj;
        }
        childChanged(controlElement, evt) {
            // Ignore events from controls we are not explicitly observing (ie grandchildren)
            if (controlElement !== evt.target) {
                return;
            }
            if (this._childValueChanging === false) {
                const valueObj = this.makeValueObj();
                this._childValueChanging = true;
                this.value = valueObj;
                this._childValueChanging = false;
            }
        }
        disableChildren() {
            const that = this;
            this.childNodes.forEach(function (childElement) {
                if (NI_SUPPORT.isElement(childElement)) {
                    childElement.disabled = that.disabled;
                }
            });
        }
        createdCallback() {
            super.createdCallback();
            this._childValueChanging = false;
            this._clusterValue = undefined;
            this._niTypeInstance = undefined;
            this._childCache = createChildCache(this);
            this._updateChildValuesQueued = false;
        }
        connectedCallback() {
            // Private Instance Properties
            // Every time _clusterValue will be modified externally or return it's value
            // it should deep copy to prevent internal state from being coupled externally
            this._clusterValue = parseInitialValue(this.getAttribute('value'));
            this._niTypeInstance = new NIType(this.niType);
            super.connectedCallback(); // Call the base implementation after having set any properties that are expected to be synced to the model.
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            if (firstCall) {
                this._niTypeInstance = new NIType(this.niType);
                this.queueUpdateChildValues();
            }
            return firstCall;
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            switch (propertyName) {
                case 'niType':
                    this._niTypeInstance = new NIType(this.niType);
                    this.queueUpdateChildValues();
                    break;
                case 'disabled':
                    this.disableChildren();
                    break;
            }
        }
        // queueUpdateChildValue on type changes and it will requeue until the childElements, type, and value settle
        queueUpdateChildValues() {
            const that = this;
            let updateSuccessful;
            if (that._updateChildValuesQueued === false) {
                updateSuccessful = that.updateChildValues();
                if (updateSuccessful) {
                    that.disableChildren();
                }
                else {
                    that._updateChildValuesQueued = true;
                    window.requestAnimationFrame(function () {
                        that._updateChildValuesQueued = false;
                        that.queueUpdateChildValues();
                    });
                }
            }
        }
        // updateChildValues on value changes as value changes are coupled with synchronous events just let them fail if state is invalid
        updateChildValues() {
            const cacheIsValid = this._childCache.updateCacheIfNeededAndValidate();
            if (cacheIsValid === false) {
                return false;
            }
            const fields = this._niTypeInstance.getFields();
            const newValue = DEEP_COPY_CONVERTER.deepCopy(this._clusterValue);
            let currField, currChild;
            let i = 0;
            for (i = 0; i < fields.length; i++) {
                currField = fields[i];
                currChild = this._childCache.getChildByFieldName(currField);
                this._childValueChanging = true;
                setElementValue(currChild, currChild.valuePropertyDescriptor.propertyNameNonSignaling, newValue[currField]);
                this._childValueChanging = false;
            }
            return true;
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(Cluster);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(Cluster.prototype, 'ni-cluster', 'HTMLNICluster');
    NationalInstruments.HtmlVI.Elements.Cluster = Cluster;
}());
//# sourceMappingURL=ni-cluster.js.map