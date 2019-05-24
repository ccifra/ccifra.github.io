"use strict";
//****************************************
// Custom Element Prototype
// DOM Registration: No
// National Instruments Copyright 2014
//****************************************
// Static Public Variables
// None
// Static Public Functions
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const INIElement = NationalInstruments.HtmlVI.Elements.INIElement;
    // Static Private Variables
    // None
    // eventmanager is a static private data structure shared across the static public functions
    const eventManager = (function () {
        let callbacks = [], fired = false;
        const addCallback = function (callback) {
            if (fired === true) {
                // Force callbacks to run asynchronously to registration
                setTimeout(function () {
                    callback();
                }, 0);
            }
            else {
                callbacks.push(callback);
            }
        };
        const scheduleCallbackExecution = function () {
            let i;
            // TODO mraj it looks like upgrades occur synchronously to dom registration / dom content load so all the attached callbacks
            // in the DOM should have fired, if not then need to scrape all elements that were not attached and listen for attachment
            // before continuing this function. The following script can be used to check for uninitialized functions
            let currElem, currElemProto, currElemDomList;
            for (currElem in NationalInstruments.HtmlVI.Elements) {
                if (NationalInstruments.HtmlVI.Elements.hasOwnProperty(currElem)) {
                    currElemProto = NationalInstruments.HtmlVI.Elements[currElem].prototype;
                    // Check for leaf nodes that are custom elements to register
                    if (currElemProto.elementInfo !== undefined) {
                        currElemDomList = document.querySelectorAll(currElemProto.elementInfo.tagName);
                        for (i = 0; i < currElemDomList.length; i = i + 1) {
                            // The _attachedCallbackFirstCall is undefined if the createdCallback has not run
                            // The _attachedCallbackFirstCall is true when createdCallback has run but attachedCallback has not run
                            if (currElemDomList[i]._attachedCallbackFirstCall === undefined || currElemDomList[i]._attachedCallbackFirstCall === true) {
                                NI_SUPPORT.error('Following element not initialized yet, require more robust initialization tracking behavior ' + currElemDomList[i]);
                            }
                        }
                    }
                }
            }
            if (fired === false) {
                NI_SUPPORT.debugVerbose('Running callbacks for event NI Element Event');
                for (i = 0; i < callbacks.length; i = i + 1) {
                    callbacks[i].call(undefined);
                }
                callbacks = [];
                fired = true;
            }
            // Unregister event is no-op if not registered
            document.removeEventListener('DOMContentLoaded', scheduleCallbackExecution);
        };
        const notifyElementsRegistered = function () {
            if (document.readyState !== 'loading') {
                // Force callbacks to run asynchronously to registration
                setTimeout(function () {
                    scheduleCallbackExecution();
                }, 0);
            }
            else {
                document.addEventListener('DOMContentLoaded', scheduleCallbackExecution);
            }
        };
        return {
            notifyElementsRegistered: notifyElementsRegistered,
            addCallback: addCallback
        };
    }());
    // Static Private Functions
    // For boolean, string, and numeric does a strict equality
    // For objects, assumes base is configuration object and other is a typedUpdateObject
    const checkTypedValuesEqual = function (base, other) {
        let name;
        if (typeof base === 'object') {
            if (typeof other !== 'object' || other === null) {
                return false;
            }
            for (name in base) {
                if (base.hasOwnProperty(name)) {
                    if (Object.is(base[name], other[name]) === false && other[name] !== undefined) {
                        return false;
                    }
                }
            }
            return true;
        }
        else {
            return Object.is(base, other);
        }
    };
    // Returns the interpreted value of the string or undefined if no value can be matched (implies use default value for attribute if undefined is returned)
    // NOTE: Should not rely on attribute specific state (i.e. so can be used by attributes not managed by attributeTable)
    // Expects typeArray of format [{propertyName: '', type: ''}, {propertyName: '', type: ''}]
    // TODO mraj currently if type array is invalid then it falls through, maybe should throw exception? Should throw exception if type arrays are part of public api... maybe should make private?
    const attributeStringToTypedValue = function (attributeName, typeArray, str) {
        let parsedJSON, typedUpdateObject, i, currType, currProp, currJSONType;
        if (typeArray.length === 1) {
            if (typeArray[0].type === 'boolean') {
                if (str === '' || str === attributeName || str === 'true') {
                    return true;
                }
                else {
                    return false;
                }
            }
            else if (typeArray[0].type === 'number') {
                if (str === null || str === undefined) {
                    return undefined;
                }
                else {
                    return parseFloat(str);
                }
            }
            else if (typeArray[0].type === 'string') {
                if (str === null || str === undefined) {
                    return undefined;
                }
                else {
                    return str;
                }
            }
        }
        else if (typeArray.length > 1) {
            try {
                parsedJSON = JSON.parse(str);
            }
            catch (e) {
                return undefined;
            }
            if (typeof parsedJSON !== 'object' || parsedJSON === null) {
                return undefined;
            }
            typedUpdateObject = {};
            for (i = 0; i < typeArray.length; i = i + 1) {
                currProp = typeArray[i].propertyName;
                currType = typeArray[i].type;
                currJSONType = typeof parsedJSON[currProp];
                if (currType === currJSONType) {
                    typedUpdateObject[currProp] = parsedJSON[currProp];
                }
                else if (currType === 'number' && (currJSONType === 'string' || parsedJSON[currProp] === null)) {
                    typedUpdateObject[currProp] = parseFloat(parsedJSON[currProp]);
                }
                else if (parsedJSON[currProp] === undefined || parsedJSON[currProp] === null) {
                    typedUpdateObject[currProp] = undefined;
                }
                else {
                    return undefined;
                }
            }
            return typedUpdateObject;
        }
    };
    // Returns a string for the value or undefined if the new value results in attribute removal (attribute removal implies false for boolean values)
    // NOTE: Should not rely on attribute specific state (i.e. so can be used by attributes not managed by attributeTable)
    // Assume that value is a valid representation of it's type (don't spend time validating the object)
    const typedValueToAttributeString = function (value) {
        const type = typeof value;
        if (type === 'boolean') {
            if (value) {
                return '';
            }
            else {
                return undefined;
            }
        }
        else if (type === 'number') {
            if (Object.is(value, -0)) {
                return '-0';
            }
            else {
                return value.toString();
            }
        }
        else if (type === 'string') {
            return value;
        }
        else if (type === 'object') {
            return JSON.stringify(value, function (k, v) {
                if (typeof v === 'number') {
                    if (isFinite(v) === false) {
                        return v.toString();
                    }
                    else if (Object.is(v, -0)) {
                        return '-0';
                    }
                }
                return v;
            });
        }
        else {
            throw new Error(NI_SUPPORT.i18n('msg_UNKNOWN_TYPE', type));
        }
    };
    // For objects, Creates a new configuration object using an existing configuration object as a base and a typedUpdateObject as a newVal
    const createUpdateValue = function (typeArray, base, newVal) {
        let sanitizedVal, i, currProp, currType, currValue;
        if (typeArray.length === 1) {
            // eslint-disable-next-line valid-typeof
            if (typeof newVal === typeArray[0].type) {
                return newVal;
            }
            else {
                throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_VALUE', typeArray[0].propertyName, typeArray[0].type));
            }
        }
        else {
            if (typeof newVal !== 'object' || newVal === null) {
                throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_VALUE', newVal, 'object'));
            }
            sanitizedVal = {};
            for (i = 0; i < typeArray.length; i = i + 1) {
                currProp = typeArray[i].propertyName;
                currType = typeArray[i].type;
                currValue = newVal[currProp];
                if (currValue === undefined) {
                    currValue = base[currProp];
                    // eslint-disable-next-line valid-typeof
                }
                else if (typeof currValue !== currType) {
                    throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_VALUE', currProp, currType));
                }
                sanitizedVal[currProp] = currValue;
            }
        }
        return sanitizedVal;
    };
    const attributeStringShouldCoerce = function (attributeName, typeArray, attributeString) {
        // Currently attribute coercion is only enabled for booleans
        if (typeArray.length === 1) {
            if (typeArray[0].type === 'boolean') {
                if (attributeString !== '' && attributeString !== null) {
                    return true;
                }
            }
        }
        return false;
    };
    // Gets the typed representation of the attribute specified
    // NOTE: This function should not rely on attribute specific state (i.e. so can be used by attributes not managed by attributeTable)
    const getAttributeTyped = function (element, attributeName, typeArray) {
        const currentAttribute = element.getAttribute(attributeName);
        return attributeStringToTypedValue(attributeName, typeArray, currentAttribute);
    };
    // Sets the attribute string to the provided value in a type-aware manner
    // NOTE: This function should not rely on attribute specific state (i.e. so can be used by attributes not managed by attributeTable)
    // Assume that value is a valid representation of it's type (don't spend time validating the object) (for objects, assume value is a configuration object)
    const setAttributeTyped = function (element, attributeName, typeArray, value) {
        const attributeString = typedValueToAttributeString(value);
        if (attributeString === undefined) {
            element.removeAttribute(attributeName);
        }
        else {
            element.setAttribute(attributeName, attributeString);
        }
    };
    // Static Private Variables
    const attributeTable = (function () {
        const attrs = {}, addAttributeConfig = function (tagName, attributeName, attributeConfig) {
            if (attrs[tagName] === undefined) {
                attrs[tagName] = {};
            }
            attrs[tagName][attributeName] = attributeConfig;
        }, getAttributeConfig = function (tagName, attributeName) {
            if (attrs[tagName] === undefined || attrs[tagName][attributeName] === undefined) {
                return undefined;
            }
            else {
                return attrs[tagName][attributeName];
            }
        }, getAttributeList = function (tagName) {
            return attrs[tagName];
        };
        return {
            addAttributeConfig: addAttributeConfig,
            getAttributeConfig: getAttributeConfig,
            getAttributeList: getAttributeList
        };
    }());
    class NIElement extends HTMLElement {
        // In cev1 we need a list of all observed attributes.
        // Since Element Extensions can add new properties, we wait until registration to get the list of properties
        static _finalizeObservedAttributes(elementClass) {
            let attrListFinal, attrListRaw, attrList;
            if (elementClass.prototype.elementInfo !== undefined) {
                attrListRaw = attributeTable.getAttributeList(elementClass.prototype.elementInfo.tagName);
                attrList = attrListRaw === undefined ? {} : attrListRaw;
                attrListFinal = Object.freeze(Object.keys(attrList));
                NI_SUPPORT.defineConstReference(elementClass, 'observedAttributes', attrListFinal);
            }
        }
        static notifyElementsRegistered() {
            eventManager.notifyElementsRegistered();
        }
        // Registers a callback function to be fired when all ni-elements that were in the dom at start-up have run the attachedCallback for the first time
        // TODO mraj This event only signifies the readiness of ni custom elements present in DOM when DOMContentREady is called. It does not signify completed loading of all
        // ni resources if resources are loaded asynchronously. Making ni-element-registration be the last loaded script can emulate the behavior of waiting for all ni resources
        // to be loaded if all script laoding is synchronous, but it is not a robust solution for asynchronous loading
        static addNIEventListener(eventName, callback) {
            if (eventName !== 'attached') {
                throw new Error('The following event is not an event supported by ni-element: ' + eventName);
            }
            if (typeof callback !== 'function') {
                throw new Error('A valid callback was not provided for ni-element to trigger for the NI Event Listener');
            }
            eventManager.addCallback(callback);
        }
        // Public Prototype Methods
        ///////////////////////////////////////////////////////////////////////////
        // Extended Methods (extend in children)
        ///////////////////////////////////////////////////////////////////////////
        // In addAllProperties place all properties managed by the addProperty method
        addAllProperties(targetPrototype) {
            // Intentionally left empty
            // Example usage:
            //proto.addProperty(targetPrototype, {
            //    propertyName: 'myProp',
            //    defaultValue: 'Default Value',
            //    fireEvent: true,
            //    addNonSignalingProperty: true
            //});
        }
        constructor() {
            super();
            this.createdCallback();
        }
        get [INIElement.NIElementSymbol]() {
            return true;
        }
        // In createdCallback place properties NOT managed by the addProperty method (Do Not Manipulate DOM Here) (Advanced use only)
        createdCallback() {
            let currAttrName, currAttrConfig, currPropValue;
            // var currAttrValue, currAttrShouldCoerce;
            // Public Instance Properties
            NI_SUPPORT.defineConstReference(this, 'niElementInstanceId', NI_SUPPORT.uniqueId());
            // Private Instance Properties
            // First call flag used by the attached callback
            if (this._attachedCallbackFirstCall !== undefined) {
                throw new Error('Created Callback has been invoked multiple times for this element');
            }
            this._attachedCallbackFirstCall = true;
            // Initialize private properties based on default values. This does not sync attributes.
            // This means that properties are accurate prior to first attach, but attributes may not be in sync.
            // On first attach we sync / coerce attribute values in attachedCallback
            const attrList = attributeTable.getAttributeList(this.elementInfo.tagName);
            for (currAttrName in attrList) {
                if (attrList.hasOwnProperty(currAttrName)) {
                    currAttrConfig = attrList[currAttrName];
                    currPropValue = currAttrConfig.defaultValue;
                    Object.defineProperty(this, currAttrConfig.privatePropertyName, {
                        configurable: false,
                        enumerable: false,
                        writable: true,
                        value: currPropValue
                    });
                }
            }
        }
        connectedCallback() {
            // This is placed here so it runs before the element extensions.
            // The element extensions have an optimization so that they synchronize element properties on
            // the propagation phase of the attached callback. This assumed that all props / attr are initialized
            // which was true in cev0. In cev1 we need to make the very first thing we do to be the attribute synchronization
            // that was moved to first attach.
            // Update attributes based on private property values
            if (this._attachedCallbackFirstCall === true) {
                let currAttrName, currAttrConfig, currPropValue, currAttrValue;
                const attrList = attributeTable.getAttributeList(this.elementInfo.tagName);
                for (currAttrName in attrList) {
                    if (attrList.hasOwnProperty(currAttrName)) {
                        currAttrConfig = attrList[currAttrName];
                        currAttrValue = getAttributeTyped(this, currAttrName, currAttrConfig.typeArray);
                        currPropValue = this[currAttrConfig.privatePropertyName];
                        if (currAttrValue === undefined) {
                            // update uninitialized attribute from property value
                            setAttributeTyped(this, currAttrName, currAttrConfig.typeArray, currPropValue);
                        }
                        else {
                            if (checkTypedValuesEqual(currPropValue, currAttrValue) === false) {
                                // override default value of property with attribute value
                                setAttributeTyped(this, currAttrName, currAttrConfig.typeArray, currAttrValue);
                            }
                        }
                    }
                }
            }
            this.attachedCallback();
        }
        // In attachedCallback manipulate the DOM for the element (insert and create dom for view)
        attachedCallback() {
            // Example usage:
            // // In child calls the parent attachedCallback returns the firstCall value
            // if (firstCall === true) {
            //     this.textContent = this.myProp;
            // }
            if (this._attachedCallbackFirstCall === true) {
                this._attachedCallbackFirstCall = false;
                return true;
            }
            else {
                return false;
            }
        }
        // In propertyUpdated respond to property changes by updating the DOM (only fired for properties and attributes managed by addProperty)
        // Only fires for property updates after the first call to attachedCallback (after the DOM has been configured)
        propertyUpdated(propertyName) {
            // Intentionally left empty
            // Example usage:
            //switch (propertyName) {
            //case 'myProp':
            //    this.textContent = this.myProp;
            //    break;
            //default:
            //    break;
            //}
        }
        // In attributeChangedCallback handle attribute changes for attributes NOT managed by the addProperty method (Advanced use only)
        attributeChangedCallback(attrName, attrOld, attrNew) {
            let typedValueOld;
            // Lookup in synced attribute table
            const attrConfig = attributeTable.getAttributeConfig(this.elementInfo.tagName, attrName);
            // Verify attribute is a synced attribute we are managing
            if (attrConfig === undefined) {
                return;
            }
            // TODO mraj found a case in browsers using the polyfill (ie and firefox) where attrOld can equal attrNew during a unit test, probably a bug in the polyfill showing a bug in the custom element
            if (attrOld === attrNew) {
                NI_SUPPORT.infoVerbose('ATTRIBUTE CHANGED CALLBACK FOR ATTRIBUTE ' + attrName + ' NEW VALUE (' + attrNew + ') EQUAL TO OLD VALUE (' + attrOld + ') SO RETURNING');
                return;
            }
            // TODO Found a case in Chrome DevTools where the current value of the attribute is not equivalent to the new value when doing Edit as HTML and removing an attribute
            // Possibly a bug in Chrome DevTools? Not 100% sure. If can reproduce in normal code (outside of DevTools) need to analyze further mraj
            const attrCurrent = this.getAttribute(attrName);
            if (attrCurrent !== attrNew) {
                NI_SUPPORT.info('ATTRIBUTE CHANGED CALLBACK FOR ATTRIBUTE ' + attrName + ' NEW VALUE (' + attrNew + ') NOT EQUAL TO CURRENT VALUE (' + attrCurrent + ') SO IGNORING NEW VALUE');
                attrNew = attrCurrent;
            }
            const typedValueNew = attributeStringToTypedValue(attrName, attrConfig.typeArray, attrNew);
            // If new attribute type is incorrect then revert attribute
            if (typedValueNew === undefined) {
                typedValueOld = attributeStringToTypedValue(attrName, attrConfig.typeArray, attrOld);
                // If reverting and the old type is invalid then force to default
                // TODO I think the only time the old value will be invalid is in the dev tools case. If can reproduce in normal code (outside of DevTools) need to analyze further mraj
                if (typedValueOld === undefined) {
                    setAttributeTyped(this, attrName, attrConfig.typeArray, attrConfig.defaultValue);
                }
                else {
                    this.setAttribute(attrName, attrOld);
                }
                // After reverting attribute finish attribute changed
                return;
            }
            const coerceAttr = attributeStringShouldCoerce(attrName, attrConfig.typeArray, attrNew);
            if (coerceAttr) {
                setAttributeTyped(this, attrName, attrConfig.typeArray, typedValueNew);
                // After coercing attribute finish attribute changed
                return;
            }
            this[attrConfig.propertyName] = typedValueNew;
        }
        disconnectedCallback() {
            this.detachedCallback();
        }
        // In detachedCallback respond to the element being removed from the DOM (usually no action needed)
        detachedCallback() {
            // Example usage:
            // No action needed
        }
        ///////////////////////////////////////////////////////////////////////////
        // Utility Methods (intended to be used, but not extended by children)
        ///////////////////////////////////////////////////////////////////////////
        // Adds the element info to the prototype and invokes the addAllProperty chain to construct element prototype
        static defineElementInfo(targetPrototype, tagName, tagPrototypeName) {
            if (typeof tagName !== 'string') {
                throw new Error('A valid string must be provided for the tag name');
            }
            if (typeof tagPrototypeName !== 'string') {
                throw new Error('A valid string must be provided for the tag prototype name');
            }
            if (targetPrototype.elementInfo !== undefined) {
                throw new Error(NI_SUPPORT.i18n('msg_ALREADY_DEFINED', 'elementInfo', tagName));
            }
            const elementInfo = {};
            NI_SUPPORT.defineConstReference(targetPrototype, 'elementInfo', elementInfo);
            NI_SUPPORT.defineConstReference(elementInfo, 'tagName', tagName);
            NI_SUPPORT.defineConstReference(elementInfo, 'prototypeName', tagPrototypeName);
            targetPrototype.addAllProperties(targetPrototype);
            Object.seal(elementInfo);
        }
        // Adds a managed property to the target prototype
        // Properties added with addProperty are not discoverable using Object.hasOwnProperty since the properties are added to the prototype and not the instance
        //     And now this is an expected feature: http://updates.html5rocks.com/2015/04/DOM-attributes-now-on-the-prototype
        addProperty(targetPrototype, config) {
            config = (typeof config !== 'object' || config === null) ? {} : config;
            const propertyName = config.propertyName;
            let defaultValue = config.defaultValue;
            const defaultValueType = typeof defaultValue;
            const fireEvent = config.fireEvent || false;
            const addQuietProperty = config.addNonSignalingProperty || false;
            const preventAttributeSync = config.preventAttributeSync || false;
            let getter;
            if (typeof propertyName !== 'string' || /^[a-z][a-zA-Z]*$/.test(propertyName) === false) {
                throw new Error(NI_SUPPORT.i18n('msg_INVALID_FORMAT', propertyName, 'ascii alpha camelCase string'));
            }
            if (defaultValueType !== 'string' && defaultValueType !== 'number' && defaultValueType !== 'boolean' && defaultValueType !== 'object') {
                throw new Error(NI_SUPPORT.i18n('msg_UNKNOWN_TYPE', defaultValueType));
            }
            if (typeof fireEvent !== 'boolean') {
                throw new Error(NI_SUPPORT.i18n('msg_UNKNOWN_TYPE', typeof fireEvent));
            }
            if (typeof addQuietProperty !== 'boolean') {
                throw new Error(NI_SUPPORT.i18n('msg_UNKNOWN_TYPE', typeof addQuietProperty));
            }
            if (typeof preventAttributeSync !== 'boolean') {
                throw new Error(NI_SUPPORT.i18n('msg_UNKNOWN_TYPE', typeof preventAttributeSync));
            }
            // The default value of boolean types is always false
            // This is because lack of a boolean attribute implies initialize to false while for other types lack of an attribute implies initialize to default
            if (defaultValueType === 'boolean' && defaultValue !== false) {
                throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_VALUE', defaultValue, 'false'));
            }
            // Make the typeArray descriptor
            const typeArray = [];
            if (defaultValueType === 'object') {
                if (defaultValue === null || Array.isArray(defaultValue)) {
                    throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_VALUE', defaultValue, 'non-null and non-array'));
                }
                (function () {
                    const confObj = {};
                    let currProp, currType;
                    for (currProp in defaultValue) {
                        if (defaultValue.hasOwnProperty(currProp)) {
                            confObj[currProp] = defaultValue[currProp];
                            currType = typeof confObj[currProp];
                            if (currType === 'boolean' || currType === 'string' || currType === 'number') {
                                typeArray.push(Object.freeze({
                                    propertyName: currProp,
                                    type: currType
                                }));
                            }
                            else {
                                throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_VALUE', currType, 'string, boolean, number'));
                            }
                        }
                    }
                    if (typeArray.length < 2) {
                        throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_VALUE', typeArray.length, '> 2 properties required'));
                    }
                    // Save the rasterized default value object
                    defaultValue = Object.freeze(confObj);
                }());
            }
            else {
                typeArray.push(Object.freeze({
                    propertyName: propertyName,
                    type: defaultValueType
                }));
            }
            Object.freeze(typeArray);
            // Determine property names and make sure to not clobber existing properties on the prototype chain ( do not check attribute or event names)
            const attributeName = propertyName.split(/(?=[A-Z])/).join('-').toLowerCase();
            // Include a '-' character to avoid collisions with DOM events
            const fireEventName = attributeName + '-changed';
            // TODO Using WeakMaps we could have actual private properties https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Contributor_s_Guide/Private_Properties#Using_WeakMaps mraj
            const privatePropertyName = '_' + propertyName;
            const quietPropertyName = propertyName + 'NonSignaling';
            if (targetPrototype[propertyName] !== undefined) {
                throw new Error(NI_SUPPORT.i18n('msg_ALREADY_DEFINED', targetPrototype[propertyName], propertyName));
            }
            if (targetPrototype[privatePropertyName] !== undefined) {
                throw new Error(NI_SUPPORT.i18n('msg_ALREADY_DEFINED', targetPrototype[privatePropertyName], propertyName));
            }
            if (targetPrototype[quietPropertyName] !== undefined) {
                throw new Error(NI_SUPPORT.i18n('msg_ALREADY_DEFINED', targetPrototype[quietPropertyName], propertyName));
            }
            // Add to synchronized attributes table to respond to attribute value changes
            attributeTable.addAttributeConfig(targetPrototype.elementInfo.tagName, attributeName, Object.freeze({
                defaultValue: defaultValue,
                typeArray: typeArray,
                privatePropertyName: privatePropertyName,
                propertyName: propertyName
            }));
            // Actions to perform on a property set or as a result of valid changes to an attribute (valid changes to an attribute result in a property set)
            const createUpdatePropertyAction = function (beQuiet) {
                // The property setter function
                const updatePropertyAction = function (value) {
                    let valuePackaged;
                    // Check if unchanged
                    if (checkTypedValuesEqual(this[privatePropertyName], value)) {
                        return;
                    }
                    // Verify and sanitize value
                    value = createUpdateValue(typeArray, this[privatePropertyName], value);
                    // Update property and attribute
                    this[privatePropertyName] = value;
                    if (preventAttributeSync === false) {
                        setAttributeTyped(this, attributeName, typeArray, this[privatePropertyName]);
                    }
                    // Call property update only if element is attached (internal DOM was built)
                    if (this._attachedCallbackFirstCall === false) {
                        this.propertyUpdated(propertyName);
                    }
                    // Fire event to notify of change if necessary
                    if (beQuiet === false && fireEvent === true) {
                        valuePackaged = {};
                        valuePackaged[propertyName] = value;
                        this.dispatchEvent(new CustomEvent(fireEventName, {
                            bubbles: true,
                            cancelable: false,
                            detail: valuePackaged
                        }));
                    }
                };
                // Assign a name to the setter funtion, this appears to show up in the stack traces in some browsers like Chrome but otherwise shouldn't have an effect
                try {
                    Object.defineProperty(updatePropertyAction, 'name', {
                        value: 'updatePropertyAction' + '_' + propertyName
                    });
                }
                catch (e) {
                    // If the browser is older and does not support setting the function name we ignore it
                }
                return updatePropertyAction;
            };
            // When getting the value of an object want to make sure to return a copy
            // TODO mraj is it worth caching the value on get? since it is frozen should be safe...
            if (defaultValueType === 'object') {
                getter = function () {
                    return Object.freeze(createUpdateValue(typeArray, this[privatePropertyName], {}));
                };
            }
            else {
                getter = function () {
                    return this[privatePropertyName];
                };
            }
            // The following property accessors are bound to the target prototype
            // The private property used in the property accessor are bound to the current object instance (i.e. 'this' is bound to the new instance)
            Object.defineProperty(targetPrototype, propertyName, {
                configurable: false,
                enumerable: true,
                get: getter,
                set: createUpdatePropertyAction(false)
            });
            if (fireEvent === true && addQuietProperty === true) {
                Object.defineProperty(targetPrototype, quietPropertyName, {
                    configurable: false,
                    enumerable: false,
                    get: getter,
                    set: createUpdatePropertyAction(true)
                });
            }
        }
    }
    window.NationalInstruments.HtmlVI.Elements.NIElement = NIElement;
}());
//# sourceMappingURL=ni-element.js.map