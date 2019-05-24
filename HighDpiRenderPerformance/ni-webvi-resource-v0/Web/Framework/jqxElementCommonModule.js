"use strict";
/**
 * Common module for controls based on JQX element. Adds common properties and lifecycle management.
 * National Instruments Copyright 2019
 */
class JqxElementCommonModule {
    static get moduleName() {
        return 'JqxElementCommonModule';
    }
    static get properties() {
        const properties = {
            niControlId: {
                value: null,
                type: 'string'
            },
            viRef: {
                value: '',
                type: 'string'
            },
            followerIds: {
                value: '[]',
                type: 'string'
            },
            bindingInfo: {
                value: {
                    prop: '',
                    field: '',
                    sync: false,
                    dco: -1,
                    dataItem: '',
                    accessMode: '',
                    unplacedOrDisabled: false,
                    isLatched: false // Indicates whether the control has latching enabled.
                },
                type: 'object'
            },
            labelId: {
                value: '',
                type: 'string'
            },
            controlResizeMode: {
                value: '',
                type: 'string'
            },
            labelAlignment: {
                value: '',
                type: 'string'
            },
            animation: Object.assign({}, JQX.BaseElement.properties.animation, { value: 'none' })
        };
        return properties;
    }
    attached() {
        if (!this.ownerElement.firstAttach) {
            this.ownerElement.firstAttach = true;
            return;
        }
        // this is for reparenting. Properties set in attach will not be applied to the elements appearance
        // (but during reparenting they are not changing anyway)
        this.constructor.setup(this.ownerElement);
    }
    detached() {
        if (this.ownerElement._preventModelCreation !== true && !NationalInstruments.JQXElement.isJQXElementSubPart(this.ownerElement)) {
            const viViewModel = NationalInstruments.HtmlVI.viReferenceService.getVIViewModelByVIRef(this.ownerElement.viRef);
            viViewModel.detachElementFromModelAndViewModel(this.ownerElement);
        }
    }
    created() {
        const element = this.ownerElement;
        Object.defineProperty(element, 'niElementInstanceId', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: NationalInstruments.HtmlVI.NISupport.uniqueId()
        });
        // update internal properties from attribute values
        this._temporarySettingsHolder = {};
        // The cartesian-axis, cursors and legends have their own
        // setFont property, so don't overwrite it.
        if (!('setFont' in element)) {
            Object.defineProperty(element, 'setFont', {
                configurable: false,
                enumerable: false,
                writable: false,
                value: function (fontSize, fontFamily, fontWeight, fontStyle, textDecoration) {
                    this.style.fontSize = fontSize;
                    this.style.fontFamily = fontFamily;
                    this.style.fontWeight = fontWeight;
                    this.style.fontStyle = fontStyle;
                    this.style.textDecoration = textDecoration;
                }
            });
        }
        if (element.hasAttribute('ni-control-id')) {
            element.niControlId = element.getAttribute('ni-control-id');
        }
        if (element.hasAttribute('label-id')) {
            element.labelId = element.getAttribute('label-id');
        }
        if (element.hasAttribute('follower-ids')) {
            element.followerIds = element.getAttribute('follower-ids');
        }
        if (element.hasAttribute('control-resize-mode')) {
            element.controlResizeMode = element.getAttribute('control-resize-mode');
        }
        if (element.hasAttribute('binding-info')) {
            let bindingInfo = element.getAttribute('binding-info');
            if (bindingInfo !== null && typeof bindingInfo === 'string') {
                bindingInfo = JSON.parse(bindingInfo);
                element.bindingInfo = bindingInfo;
            }
        }
        if (element.hasAttribute('vi-ref')) {
            element.viRef = element.getAttribute('vi-ref');
        }
    }
    ready() {
        // It's necessary to initialize these attributes if not already set.
        // Setting a property value will automatically set the attribute value as well.
        // But these properties are not always set, so we need to manually set a default attribute value.
        if (!this.ownerElement.hasAttribute('vi-ref')) {
            this.ownerElement.setAttribute('vi-ref', this.viRef);
        }
        if (!this.ownerElement.hasAttribute('follower-ids')) {
            this.ownerElement.setAttribute('follower-ids', this.followerIds);
        }
        this.ownerElement.firstAttach = false;
        // this is for first time setup - the properties set here will be applied to the elements appearance
        this.constructor.setup(this.ownerElement);
    }
    static setup(element) {
        element.viRef = '';
        if (!NationalInstruments.JQXElement.isJQXElementSubPart(element)) {
            if (element._preventModelCreation !== true) {
                const viViewModel = NationalInstruments.HtmlVI.viReferenceService.getVIViewModelByVIRef(element.viRef);
                const controlModelViewModel = viViewModel.attachElementToModelAndViewModel(element);
                controlModelViewModel.controlViewModel.bindToView();
            }
            if (typeof element.elementInfo.viewReady === 'function') {
                element.elementInfo.viewReady(element);
            }
        }
    }
    static generateClearProperties() {
        return function clearProperties() {
            if (this.niControlId !== undefined) {
                this.niControlId = '';
                this.viRef = '';
                this.bindingInfo = {
                    prop: '',
                    field: '',
                    sync: false,
                    dco: -1,
                    dataItem: '',
                    accessMode: '',
                    unplacedOrDisabled: false,
                    isLatched: false
                };
                this.labelId = '';
                this.controlResizeMode = '';
            }
        };
    }
}
NationalInstruments.HtmlVI.JqxElementCommonModule = JqxElementCommonModule;
//# sourceMappingURL=jqxElementCommonModule.js.map