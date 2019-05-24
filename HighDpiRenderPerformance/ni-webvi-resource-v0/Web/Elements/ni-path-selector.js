"use strict";
//****************************************
// Path Selector Control Prototype
// DOM Registration: No
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const $ = NationalInstruments.Globals.jQuery;
    // Static Private Variables
    const PATH_TYPE_ENUM = Object.freeze({
        ABSOLUTE: 'absolute',
        RELATIVE: 'relative'
    });
    // Static Private Functions
    const enablePopup = function (target) {
        const jqref = $(target.firstElementChild);
        const jqrefPopoverContainer = $(target._popoverTag);
        if (target.popupEnabled === true) {
            const jqrefPathControlButton = jqref.find('.jqx-path-control-button');
            jqrefPopoverContainer.jqxPopover({
                selector: jqrefPathControlButton,
                position: 'right',
                animationOpenDelay: 0,
                animationCloseDelay: 0
            });
        }
        else {
            jqrefPopoverContainer.jqxPopover('destroy');
        }
    };
    const filterEmptyString = function (str) {
        return str.length !== 0;
    };
    const pathToObject = function (pathString) {
        let components = pathString.split('/'), // unix format expected.
        type;
        if (components[0].length === 0) {
            type = PATH_TYPE_ENUM.ABSOLUTE;
        }
        else {
            type = PATH_TYPE_ENUM.RELATIVE;
        }
        components = components.filter(filterEmptyString);
        return { components: components, type: type };
    };
    const objectToPath = function (pathObject) {
        pathObject = JSON.parse(pathObject);
        /* TODO mraj this is not possible, undefined is not a valid JSON value, instead JSON.parse will throw */
        if (pathObject === undefined || pathObject.components === undefined) {
            return '';
        }
        let pathString = pathObject.components.join('/');
        if (pathObject.type === PATH_TYPE_ENUM.ABSOLUTE) {
            pathString = '/' + pathString;
            // jqwidgets bug. not possible to set an absolute path containing only
            // one segment in unix format.
            if (pathObject.components.length === 1) {
                pathString += '/';
            }
        }
        return pathString;
    };
    class PathSelector extends NationalInstruments.HtmlVI.Elements.Visual {
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = PathSelector.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'path',
                defaultValue: JSON.stringify({ components: [], type: PATH_TYPE_ENUM.ABSOLUTE }),
                fireEvent: true,
                addNonSignalingProperty: true
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'format',
                defaultValue: 'windows'
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'popupEnabled',
                defaultValue: false
            });
            NI_SUPPORT.setValuePropertyDescriptor(targetPrototype, 'path', 'path', 'pathNonSignaling', 'path-changed');
        }
        setPath(pathValue) {
            // We don't want to fire more events for re-setting the path
            // once we cleared the value.
            if (!(this.isNotAPath() && pathValue === '')) {
                this.path = JSON.stringify(pathToObject(pathValue));
            }
        }
        setNotAPath() {
            this.path = JSON.stringify({ components: [], type: PATH_TYPE_ENUM.ABSOLUTE });
        }
        isNotAPath() {
            const pathValue = JSON.parse(this.path);
            if (pathValue === undefined || pathValue === null || pathValue.components === undefined) {
                return true;
            }
            return pathValue.components.length === 0 && pathValue.type === PATH_TYPE_ENUM.ABSOLUTE;
        }
        createdCallback() {
            super.createdCallback();
            this._popoverTag = undefined;
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            const that = this;
            let widgetSettings, childElement, jqref, button;
            if (firstCall === true) {
                widgetSettings = {};
                widgetSettings.readOnly = this.readOnly;
                widgetSettings.pathFormat = this.format;
                widgetSettings.accept = '.*';
                childElement = document.createElement('div');
                childElement.classList.add('ni-path-box');
                this.appendChild(childElement);
                jqref = $(childElement);
                jqref.jqxPathControl(widgetSettings);
                jqref.jqxPathControl('val', objectToPath(this.path));
                this._popoverTag = document.createElement('div');
                button = document.createElement('button');
                button.classList.add('ni-path-selector', 'ni-not-a-path-reset-button');
                button.type = 'button';
                button.textContent = NI_SUPPORT.i18n('msg_SET_TO_NOT_A_PATH');
                button.addEventListener('click', function () {
                    $(that._popoverTag).jqxPopover('close');
                    that.setNotAPath();
                });
                this._popoverTag.appendChild(button);
                enablePopup(this);
                jqref.on('change', function () {
                    that.setPath(jqref.val('unix')); // because is easier to convert to object.
                });
            }
            return firstCall;
        }
        forceResize(size) {
            super.forceResize(size);
            $(this.firstElementChild).jqxPathControl(size);
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            const childElement = this.firstElementChild, jqref = $(childElement);
            switch (propertyName) {
                case 'readOnly':
                    jqref.jqxPathControl({ readOnly: this.readOnly });
                    break;
                case 'path':
                    if (this.isNotAPath()) {
                        jqref.jqxPathControl('clear');
                    }
                    else {
                        jqref.jqxPathControl('val', objectToPath(this.path));
                    }
                    break;
                case 'format':
                    jqref.jqxPathControl({ pathFormat: this.format });
                    break;
                case 'popupEnabled':
                    enablePopup(this);
                    break;
            }
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(PathSelector);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(PathSelector.prototype, 'ni-path-selector', 'HTMLNIPathSelector');
    NationalInstruments.HtmlVI.Elements.PathSelector = PathSelector;
    NationalInstruments.HtmlVI.Elements.PathSelector.PathTypeEnum = PATH_TYPE_ENUM;
}());
//# sourceMappingURL=ni-path-selector.js.map