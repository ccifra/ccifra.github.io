"use strict";
//****************************************
// Support functions
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // National Instruments global namespace
    window.NationalInstruments = window.NationalInstruments || {};
    // Namespace for HtmlVI feature
    NationalInstruments.HtmlVI = {};
    // Namespace for HtmlVI Models
    NationalInstruments.HtmlVI.Models = {};
    // Namespace for HtmlVI View Models
    NationalInstruments.HtmlVI.ViewModels = {};
    // Namespace for HtmlVI Framework elements
    NationalInstruments.HtmlVI.Framework = {};
    // Namespace for HtmlVI Elements feature
    NationalInstruments.HtmlVI.Elements = {};
    // Namespace for JQXElements
    NationalInstruments.JQXElement = {};
    // Namespace for JQXElementMixins
    NationalInstruments.JQXElementMixins = {};
    // the template id attribute appended to clones of a template element within array and data-grid
    const TemplateIdAttribute = 'ni-template-id';
    class NI_SUPPORT {
        static isJQXElement(element) {
            return element.niControlId !== undefined &&
                !(NationalInstruments.HtmlVI.Elements.INIElement.isNIElement(element));
        }
        static isElement(element) {
            return element.niControlId !== undefined ||
                NationalInstruments.HtmlVI.Elements.INIElement.isNIElement(element);
        }
        static defineConstReference(objTarget, propName, value) {
            Object.defineProperty(objTarget, propName, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: value
            });
        }
        static setValuePropertyDescriptor(objTarget, attributeName, propertyName, propertyNameNonSignaling, eventName) {
            if (objTarget.hasOwnProperty('valuePropertyDescriptor')) {
                throw new Error('valuePropertyDescriptor has already been set');
            }
            NI_SUPPORT.defineConstReference(objTarget, 'valuePropertyDescriptor', Object.freeze({
                attributeName: attributeName,
                propertyName: propertyName,
                propertyNameNonSignaling: propertyNameNonSignaling,
                eventName: eventName
            }));
        }
        static uniqueId() {
            // Math.random should be unique because of its seeding algorithm. // TODO mraj this statement is not true, and looks like it was copied from here: https://gist.github.com/gordonbrander/2230317
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return '_' + Math.random().toString(36).substr(2, 9);
        }
        static jqxDateTimeToAttributeString(val) {
            return 'DateTime(\'' + val.toTimeZone('UTC').toString('yyyy-MM-dd HH:mm:ss.fff') + '\', \'UTC\')';
        }
        static cloneControlElement(element) {
            const result = element.cloneNode(false);
            switch (element.tagName) {
                // Controls which have 'text components' that don't map to attributes on the top-level control element
                // (e.g. our booleans) need additional logic to clone their content
                case 'JQX-CHECK-BOX':
                    result.content = cloneBooleanContent(element.content);
                    break;
                case 'JQX-SWITCH-BUTTON':
                case 'JQX-LED':
                    result.trueContent = cloneBooleanContent(element.trueContent);
                    result.falseContent = cloneBooleanContent(element.falseContent);
                    break;
                case 'JQX-TOGGLE-BUTTON':
                    {
                        // and hence will get reset to its innerDOM. So both the cases needs to be handled separatly.
                        const tempContent = element.content instanceof HTMLElement ? element.content.innerHTML : element.content;
                        result.content = cloneBooleanContent(tempContent);
                        break;
                    }
                case 'JQX-LIST-BOX':
                    // JQXListBox dataSource isn't reflected as an attribute, so clone the items collection too
                    if (Array.isArray(element.dataSource)) {
                        result.dataSource = JSON.parse(JSON.stringify(element.dataSource));
                        // Preserve selection after updating the items
                        if (Array.isArray(element.selectedIndexes)) {
                            result.selectedIndexes = JSON.parse(JSON.stringify(element.selectedIndexes));
                        }
                    }
                    break;
                case 'JQX-DATE-TIME-PICKER':
                    // Attribute presentation of jqxDateTime fields don't fully encode fractional
                    // milliseconds or timezone
                    result.setAttribute('min', NI_SUPPORT.jqxDateTimeToAttributeString(element.min));
                    result.setAttribute('max', NI_SUPPORT.jqxDateTimeToAttributeString(element.max));
                    result.setAttribute('value', NI_SUPPORT.jqxDateTimeToAttributeString(element.value));
                    break;
            }
            return result;
        }
        static setTemplateId(element, templateId) {
            element.setAttribute(TemplateIdAttribute, templateId);
        }
        static getTemplateId(element) {
            if (element.hasAttribute(TemplateIdAttribute)) {
                return element.getAttribute(TemplateIdAttribute);
            }
            return undefined;
        }
        static queryAllControlsByNIControlId(viRef, niControlId) {
            // We should be able to use the following selector however in EdgeHTML 15.X with vi-ref as empty string this fails.
            // If vi-ref is not empty string this passes (finds the elements).
            // On a standalone page where all the custom elements are removed but the scripts remain this passes (when no custom elements are present the selector works for empty strings, but this isn't really useful because there are no custom elements).
            // On every other browser this passes including pre EdgeHTML 15 versions of the Edge browser.
            // let selector = '[vi-ref="' + element.viRef + '"][ni-control-id="' + element.niControlId + '"]';
            // return document.querySelectorAll(selector).length === 1
            const selector = '[vi-ref][ni-control-id="' + niControlId + '"]';
            const els = document.querySelectorAll(selector);
            const filteredEls = Array.prototype.slice.call(els).filter(function (el) {
                return el.getAttribute('vi-ref') === viRef;
            });
            return filteredEls;
        }
        static queryControlByNIControlId(viRef, niControlId) {
            // Have to search all controls (because some may be filtered) and select just one
            const els = NI_SUPPORT.queryAllControlsByNIControlId(viRef, niControlId);
            if (els.length === 0) {
                return null;
            }
            else {
                return els[0];
            }
        }
        static queryVirtualInstrumentsByVIRef(viRef) {
            const selector = 'ni-virtual-instrument[vi-ref]';
            const els = document.querySelectorAll(selector);
            const filteredEls = Array.prototype.slice.call(els).filter(function (el) {
                return el.viRef === viRef;
            });
            return filteredEls;
        }
        // inheritFromParent must be created outside the 'use strict' block
        static inheritFromParent(childType, parentType) {
            // NOTE THE LACK OF USE STRICT FOR THIS FUNCTION
            // TODO mraj Safari 8 will throw an Exception trying to modify the constructor property in strict mode
            // Possibly related to (https://bugs.webkit.org/show_bug.cgi?id=74193) Custom elements extend from HTMLElement and in Safari HTMLElement is not a constructor function
            // Static Private Reference Aliases
            const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
            if (Object.keys(childType.prototype).length > 0) {
                throw new Error('Properties added to the constructor function prototype object are lost during function invocation. Add after function invocation');
            }
            try {
                // The default constructor function prototype object inherts from window.Object. Create a new constructor function prototype object that inherits from parent.
                // Note: This will discard the existing childType.prototype so make sure to invoke inheritFromParent before adding to the childType.prototype
                childType.prototype = Object.create(parentType.prototype);
                // The default constructor reference points to the window.Object function constructor. Change the constructor reference to now point to the child.
                childType.prototype.constructor = childType;
            }
            catch (e) {
                NI_SUPPORT.info(e.message);
            }
            return childType.prototype;
        }
    }
    NationalInstruments.HtmlVI.NISupport = NI_SUPPORT;
    // Synchronize render buffer runs updates immediately instead of using raf
    NI_SUPPORT.defineConstReference(NI_SUPPORT, 'SYNCHRONIZE_RENDER_BUFFER', false);
    // Wrappers for console functions
    const noop = function () { };
    const verbosePrefix = 'NISUPPORT_VERBOSE_LOG: '; // keep in sync with HtmlVIPanelControl.cs
    NI_SUPPORT.log = console.log.bind(console); // eslint-disable-line no-console
    NI_SUPPORT.error = console.error.bind(console); // eslint-disable-line no-console
    NI_SUPPORT.warn = console.warn.bind(console); // eslint-disable-line no-console
    NI_SUPPORT.debug = console.debug.bind(console); // eslint-disable-line no-console
    NI_SUPPORT.info = console.info.bind(console); // eslint-disable-line no-console
    NI_SUPPORT.group = console.group.bind(console); // eslint-disable-line no-console
    NI_SUPPORT.groupEnd = console.groupEnd.bind(console); // eslint-disable-line no-console
    // Append one of the #strings below to the end of the URL to enable different levels of additional logging.
    // Keep in sync with VIHttpContentProvider.cs
    NI_SUPPORT.defineConstReference(NI_SUPPORT, 'VERBOSE', window.location.hash.indexOf('webviverboselogging') >= 0);
    NI_SUPPORT.defineConstReference(NI_SUPPORT, 'VERBOSE_INFO', window.location.hash.indexOf('webviverboselogginginfo') >= 0);
    const appendVerbosePrefix = function (func) {
        return function (...innerArgs) {
            innerArgs[0] = verbosePrefix + innerArgs[0];
            func.apply(null, innerArgs);
        };
    };
    NI_SUPPORT.logVerbose = NI_SUPPORT.VERBOSE ? appendVerbosePrefix(NI_SUPPORT.log) : noop;
    NI_SUPPORT.errorVerbose = NI_SUPPORT.VERBOSE ? appendVerbosePrefix(NI_SUPPORT.error) : noop;
    NI_SUPPORT.debugVerbose = NI_SUPPORT.VERBOSE ? appendVerbosePrefix(NI_SUPPORT.debug) : noop;
    NI_SUPPORT.infoVerbose = NI_SUPPORT.VERBOSE && NI_SUPPORT.VERBOSE_INFO ? appendVerbosePrefix(NI_SUPPORT.info) : noop;
    NI_SUPPORT.groupVerbose = NI_SUPPORT.VERBOSE ? console.group.bind(console) : noop; // eslint-disable-line no-console
    NI_SUPPORT.groupEndVerbose = NI_SUPPORT.VERBOSE ? console.groupEnd.bind(console) : noop; // eslint-disable-line no-console
    const cloneBooleanContent = function (content) {
        if (content instanceof window.HTMLElement) {
            return content.cloneNode(true);
        }
        else if (typeof content === 'string') {
            return content;
        }
        throw new Error('Unexpected boolean content type');
    };
    // Escape a string so that it can be safely used in HTML. ie NI_SUPPORT.escapeHTML('<hi>') // &lt;hi&gt;
    (function () {
        const div = document.createElement('div');
        NI_SUPPORT.escapeHtml = function (text) {
            div.textContent = text;
            return div.innerHTML;
        };
    }());
    // Unescape a HTML entities. ie  (&lt;hi&gt;) -> ('<hi>')
    (function () {
        const textArea = document.createElement('textarea');
        NI_SUPPORT.unescapeHtml = function (text) {
            textArea.innerHTML = text;
            return textArea.value;
        };
    }());
    // TODO mraj this needs to be moved to a location more relevant to its usage
    // Defines Events enum for Event Structure support
    // We need to keep this values in synchrony with the ones defined in CommonEventIndex.cs
    NationalInstruments.HtmlVI.EventsEnum = Object.freeze({
        NONE: 0,
        CLICK: 1,
        VALUE_CHANGE: 2,
        RIGHT_CLICK: 3,
        BUTTON_CLICK: 4
    });
}());
//# sourceMappingURL=niSupport.js.map