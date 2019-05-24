"use strict";
//****************************************
// Visual Component Prototype
// DOM Registration: No
// National Instruments Copyright 2014
//****************************************
// Constructor Function: Empty (Not Invoked)
// For custom elements the constructor function is never invoked but is instead used for the prototype chain. See the createdCallback for perfoming actions on a new instance.
// NationalInstruments.HtmlVI.Elements.VisualComponent = function () {
//     'use strict';
// };
// Static Public Variables
// Common use case is publically shared constant enums, ex:
// NationalInstruments.HtmlVI.Elements.VisualComponent.MyValueEnum = Object.freeze({
//     VALUE_1: 'VALUE_1',
//     VALUE_2: 'VALUE_2',
//     VALUE_3: 'VALUE_3',
// });
// Static Public Functions
// Use case can be publically shared helper functions, ex:
// NationalInstruments.HtmlVI.Elements.VisualComponent.MY_PUBLIC_HELPER_FUNCTION = function () {
//     'use strict';
//     return 42;
// }
(function () {
    'use strict';
    // Static Private Reference Aliases
    // Common use case is aliases or enums that are shared across all instances, ex:
    // var MY_VALUE_ENUM = NationalInstruments.HtmlVI.NISupport.MyValueEnum;
    // NOTE: SHOULD NOT REFERENCE THE 'this' VARIABLE
    // var NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class VisualComponent extends NationalInstruments.HtmlVI.Elements.NIElement {
        // Static Private Variables
        // Common use case is constants or caches that are shared across all instances, ex:
        // var MY_CONSTANT = 3.14;
        // NOTE: SHOULD NOT REFERENCE THE 'this' VARIABLE
        // Static Private Functions
        // Common use case is helper functions used privately in the class and cannot be overridden by child classes, ex:
        // var myHelperFunction = function () {
        //     return 42;
        // }
        // NOTE: SHOULD NOT REFERENCE THE 'this' VARIABLE
        // Public Prototype Methods
        // Common use case is defining methods that are available to instances via the prototype chain and can be overriden by child classes, ex see the following prototype methods:
        // NOTE: MAY REFERENCE THE 'this' VARIABLE
        // addAllProperties is invoked during registration of the element to add all the properties managed by the ni-element framework. To add properties not managed by the framework see the createdCallback.
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = VisualComponent.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'disabled',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'niControlId',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'viRef',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'followerIds',
                defaultValue: '[]'
            });
        }
        // createdCallback is called once during the creation of an element. This is a good time to add additional properties to the instance but as the element may or may not be added to the DOM yet, it is probably not a good time to build internal DOM structure. To build internal DOM structure see the attachedCallback.
        createdCallback() {
            super.createdCallback();
            // Public Instance Properties
            // Common use case is adding properties to the custom element js object that are not managed by the framework (no DOM attribute synchronization, no events on change, etc), ex:
            // this.myMagicalValue = MY_VALUE_ENUM.VALUE_1;
            // Private Instance Properties
            // Common use case is having private per instance data. Unfortunately JavaScript cannot actually represent this type of data; the best we can do is use a convention on a public instance property, like this._myPrivateData, or instead make a static private variable table that can be indexed by a unique value given to each instance (WeakMaps would be very helpful for this in modern browsers). Ex:
            // this._myNotRuntimeEnforcedSecretMagicalValue = MY_VALUE_ENUM.VALUE_1;
            // Latest recorded size from resizeEventHack.
            this._latestSize = { width: undefined, height: undefined };
            // Used by VIModel to temporarily save settings used to initialize element in a private instance property
            this._temporaryModelSettingsHolder = undefined;
        }
        // attachedCallback is called every time the element instance has been inserted into the DOM. A good time to create the element's internal DOM is when the firstCall value is true
        attachedCallback() {
            const that = this;
            let viViewModel;
            // Create Model and ViewModel (this will synchronize element attributes <-> model properties)
            // Assumptions:
            // Element is in the DOM
            // Element internal DOM not created yet
            // _preventModelCreation can be undefined or true, so must check if !true
            if (that._preventModelCreation !== true) {
                viViewModel = NationalInstruments.HtmlVI.viReferenceService.getVIViewModelByVIRef(that.viRef);
                viViewModel.attachElementToModelAndViewModel(that);
            }
            // Call super after creating model and view model, so that _attachedCallbackFirstCall isn't set too early
            const firstCall = super.attachedCallback();
            if (firstCall) {
                that.addEventListener('resizeEventHack', function (e) {
                    const width = parseInt(e.detail.width), height = parseInt(e.detail.height);
                    if (that._latestSize.width !== width || that._latestSize.height !== height) {
                        that._latestSize.height = height;
                        that._latestSize.width = width;
                        that.forceResize(that._latestSize);
                    }
                });
            }
            return firstCall;
        }
        // detachedCallback is called AFTER an element has been removed from the DOM (every time the element is removed). It is not frequently used.
        detachedCallback() {
            const that = this;
            // _preventModelCreation can be undefined or true, so must check if !true
            if (that._preventModelCreation !== true) {
                const viViewModel = NationalInstruments.HtmlVI.viReferenceService.getVIViewModelByVIRef(that.viRef);
                viViewModel.detachElementFromModelAndViewModel(that);
            }
        }
        // forceResize is called every time the resizeEventHack fires and width and height are different from the previous values.
        forceResize(size) {
            // Do nothing.
        }
        clearProperties() {
            this.disabled = false;
            this.niControlId = '';
            this.viRef = '';
            this.followerIds = '[]';
        }
        // Adds the element info to the prototype and invokes the addAllProperty chain to construct element prototype
        static defineElementInfo(targetPrototype, tagName, tagPrototypeName) {
            NationalInstruments.HtmlVI.Elements.NIElement.defineElementInfo(targetPrototype, tagName, tagPrototypeName);
            targetPrototype.attachedCallback = this.generateAttachedCallback(targetPrototype.attachedCallback);
        }
        static generateAttachedCallback(orig) {
            return function () {
                const that = this;
                // Attach and populate internal DOM (as needed)
                const firstCall = orig.apply(that, arguments);
                const viModel = NationalInstruments.HtmlVI.viReferenceService.getVIModelByVIRef(that.viRef);
                const controlModel = viModel.getControlModel(this.niControlId);
                const controlViewModel = viModel.getControlViewModel(this.niControlId);
                // Complete ViewModel - View binding
                // Assumptions:
                // Element is in the DOM
                // Element internal DOM created
                // _preventModelCreation can be undefined or true, so must check if !true
                if (that._preventModelCreation !== true) {
                    controlViewModel.bindToView();
                    if (controlViewModel._needsResizeHack === true) {
                        that.dispatchEvent(new CustomEvent('resizeEventHack', {
                            detail: {
                                width: controlModel.width,
                                height: controlModel.height
                            }
                        }));
                    }
                }
                return firstCall;
            };
        }
    }
    NationalInstruments.HtmlVI.Elements.VisualComponent = VisualComponent;
}());
//# sourceMappingURL=ni-visual-component.js.map