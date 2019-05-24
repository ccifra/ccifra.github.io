"use strict";
//****************************************
// Visual Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NIType = window.NIType;
    const NITypes = window.NITypes;
    const NITypeNames = window.NITypeNames;
    const _controlResizeModeEnum = Object.freeze({
        FIXED: 'fixed',
        MAINTAIN_ASPECT_RATIO: 'maintain-aspect-ratio',
        BOTH_DIRECTIONS: 'both-directions',
        RESIZE_HORIZONTALY: 'resize-horizontally'
    });
    const IRootModel = NationalInstruments.HtmlVI.Models.IRootModel;
    class VisualModel extends NationalInstruments.HtmlVI.Models.VisualComponentModel {
        constructor(id) {
            super(id);
            this.localBindingInfo = null;
            this.defaultValue = undefined;
            // TODO mraj I will buy the team a keg if we agree to stop introducing supression flags
            this.suppressControlChanged = false;
            this._top = '0px';
            this._left = '0px';
            this._width = '100px';
            this._height = '100px';
            this._background = 'white';
            this._foreground = 'rgb(0, 0, 0)';
            this._fontSize = '12px';
            this._fontFamily = 'sans-serif';
            this._fontWeight = 'normal';
            this._fontStyle = 'normal';
            this._textDecoration = 'none';
            this._visible = true;
            this._readOnly = false;
            this._labelId = '';
            this._enabled = true;
            this._bindingInfo = {};
            this._niType = undefined;
            this._controlResizeMode = VisualModel.ControlResizeModeEnum.FIXED;
            this._borderWidth = '0';
            this._margin = '0';
            this._padding = '0';
            this._labelAlignment = '';
        }
        static get ControlResizeModeEnum() {
            return _controlResizeModeEnum;
        }
        static get DISABLED_G_PROPERTY_NAME() {
            return "Disabled";
        }
        static get POSITION_G_PROPERTY_NAME() {
            return "Position";
        }
        static get LABEL_G_PROPERTY_NAME() {
            return "Label";
        }
        static get SIZE_G_PROPERTY_NAME() {
            return "Size";
        }
        static get VALUE_G_PROPERTY_NAME() {
            return "Value";
        }
        static get VALUE_SIGNALING_G_PROPERTY_NAME() {
            return "ValueSignaling";
        }
        static get VISIBLE_G_PROPERTY_NAME() {
            return "Visible";
        }
        static get TOTAL_BOUNDS_G_PROPERTY_NAME() {
            return "TotalBounds";
        }
        get top() {
            return this._top;
        }
        set top(value) {
            this._top = value;
            this.notifyModelPropertyChanged('top');
        }
        get left() {
            return this._left;
        }
        set left(value) {
            this._left = value;
            this.notifyModelPropertyChanged('left');
        }
        get width() {
            return this._width;
        }
        set width(value) {
            this._width = value;
            this.notifyModelPropertyChanged('width');
        }
        get height() {
            return this._height;
        }
        set height(value) {
            this._height = value;
            this.notifyModelPropertyChanged('height');
        }
        get background() {
            return this._background;
        }
        set background(value) {
            this._background = value;
            this.notifyModelPropertyChanged('background');
        }
        get foreground() {
            return this._foreground;
        }
        set foreground(value) {
            this._foreground = value;
            this.notifyModelPropertyChanged('foreground');
        }
        get fontSize() {
            return this._fontSize;
        }
        set fontSize(value) {
            this._fontSize = value;
            this.notifyModelPropertyChanged('fontSize');
        }
        get fontFamily() {
            return this._fontFamily;
        }
        set fontFamily(value) {
            this._fontFamily = value;
            this.notifyModelPropertyChanged('fontFamily');
        }
        get fontWeight() {
            return this._fontWeight;
        }
        set fontWeight(value) {
            this._fontWeight = value;
            this.notifyModelPropertyChanged('fontWeight');
        }
        get fontStyle() {
            return this._fontStyle;
        }
        set fontStyle(value) {
            this._fontStyle = value;
            this.notifyModelPropertyChanged('fontStyle');
        }
        get textDecoration() {
            return this._textDecoration;
        }
        set textDecoration(value) {
            this._textDecoration = value;
            this.notifyModelPropertyChanged('textDecoration');
        }
        get visible() {
            return this._visible;
        }
        set visible(value) {
            this._visible = value;
            this.notifyModelPropertyChanged('visible');
        }
        get readOnly() {
            return this._readOnly;
        }
        set readOnly(value) {
            this._readOnly = value;
            this.notifyModelPropertyChanged('readOnly');
        }
        get labelId() {
            return this._labelId;
        }
        set labelId(value) {
            this._labelId = value;
            this.notifyModelPropertyChanged('labelId');
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._enabled = value;
            this.notifyModelPropertyChanged('enabled');
        }
        get bindingInfo() {
            return this._bindingInfo;
        }
        set bindingInfo(value) {
            this._bindingInfo = value;
            this.notifyModelPropertyChanged('bindingInfo');
        }
        get niType() {
            return this._niType;
        }
        set niType(value) {
            this._niType = value instanceof NIType ? value : new NIType(value);
            this.notifyModelPropertyChanged('niType');
        }
        get controlResizeMode() {
            return this._controlResizeMode;
        }
        set controlResizeMode(value) {
            this._controlResizeMode = value;
            this.notifyModelPropertyChanged('controlResizeMode');
        }
        get borderWidth() {
            return this._borderWidth;
        }
        set borderWidth(value) {
            this._borderWidth = value;
            this.notifyModelPropertyChanged('borderWidth');
        }
        get margin() {
            return this._margin;
        }
        set margin(value) {
            this._margin = value;
            this.notifyModelPropertyChanged('margin');
        }
        get padding() {
            return this._padding;
        }
        set padding(value) {
            this._padding = value;
            this.notifyModelPropertyChanged('padding');
        }
        get labelAlignment() {
            return this._labelAlignment;
        }
        set labelAlignment(value) {
            this._labelAlignment = value;
            this.notifyModelPropertyChanged('labelAlignment');
        }
        /**
         * This method is meant to be overriden by all of our JS control models that set their niType property.
         * The common case is a control with a 'value' property: it should override this, and return true if propertyName === 'value'.
         * For controls that have multiple typed properties (e.g. numerics; value=ComplexDouble implies min/max/interval are also ComplexDouble),
         * this method should return true for all of those property names.
         */
        modelPropertyUsesNIType(propertyName) {
            if (this.niType !== undefined) {
                throw new Error('Any control model that sets niType must override propertyUsesNITypeProperty()');
            }
        }
        /**
         * Gets the type of a property as an NIType.  This used when packing property values to
         * marshal in an update service.
         * Override this if properties other than the bound value property notify when they are changed.
         * @param {string} propertyName the gPropertyName of the property to get the type for
         * @returns the NIType of the property is return if the property should be handled.  undefined will be
         * returned for properties that cannot be packed and should be ignored.
         * @memberof VisualModel
         */
        gPropertyNIType(gPropertyName) {
            switch (gPropertyName) {
                case this.bindingInfo.prop:
                case VisualModel.VALUE_G_PROPERTY_NAME:
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    return this.niType;
                case VisualModel.POSITION_G_PROPERTY_NAME:
                    return new NIType({ name: NITypeNames.CLUSTER, fields: ['Left', 'Top'], subtype: [NITypeNames.SINGLE, NITypeNames.SINGLE] });
                case VisualModel.DISABLED_G_PROPERTY_NAME:
                    return NITypes.BOOLEAN;
            }
            return undefined;
        }
        /**
         * Determines if a property supports a virtualized value.  This is used when converting
         * the data value to a format appropriate for this control.
         * @param {string} propertyName the name of the property whose data is being converted
         */
        propertySupportsVirtualization(propertyName) {
            return false;
        }
        /**
         * Determines if a property supports array like values (TypedArrays) or it is only supports
         * real arrays.  This is used when converting the data value to a format appropriate
         * for this control.
         * @param {string} propertyName the name of the property whose data is being converted
         */
        propertySupportsArrayLikeTypes(propertyName) {
            return false;
        }
        setMultipleProperties(settings, typedValueAdapter) {
            if (settings.hasOwnProperty('niType')) {
                // We need to apply the NIType before other properties. It's also used for our editor->model
                // data conversion below so we need the latest NIType for that too.
                this.niType = settings.niType;
                delete settings.niType; // We've already handled niType, so setMultipleProperties doesn't need to, below
            }
            if (typedValueAdapter !== undefined) {
                for (const propertyName in settings) {
                    if (settings.hasOwnProperty(propertyName) && this.modelPropertyUsesNIType(propertyName)) {
                        const options = {
                            supportsVirtualization: this.propertySupportsVirtualization(propertyName),
                            supportsArrayLikeTypes: this.propertySupportsArrayLikeTypes(propertyName)
                        };
                        settings[propertyName] = typedValueAdapter(settings[propertyName], this.niType, options);
                    }
                }
            }
            super.setMultipleProperties(settings);
        }
        setBindingInfo(bindingInfo) {
            this.bindingInfo = bindingInfo;
        }
        updateLabelDisabledState(disabled) {
            const viModel = this.getRoot();
            if (viModel !== undefined) {
                if (this.labelId !== '') {
                    viModel.controlModels[this.labelId].enabled = !disabled;
                }
            }
        }
        getBindingInfo() {
            return this.bindingInfo;
        }
        getRemoteBindingInfo() {
            return {
                prop: this.bindingInfo.prop,
                dco: this.bindingInfo.dco,
                controlId: this.niControlId
            };
        }
        getEditorRuntimeBindingInfo() {
            return {
                prop: this.bindingInfo.prop,
                dataItem: this.bindingInfo.dataItem,
                controlId: this.niControlId
            };
        }
        getLocalBindingInfo() {
            if (this.localBindingInfo === null) {
                this.localBindingInfo = this.generateLocalBindingInfo();
            }
            return this.localBindingInfo;
        }
        getDefaultValue() {
            return this.defaultValue;
        }
        setDefaultValue(defaultValue) {
            this.defaultValue = defaultValue;
        }
        generateVireoPath() {
            if (!this.isDataItemBoundControl()) {
                return undefined;
            }
            else {
                return this.getBindingInfo().dataItem;
            }
        }
        /**
         * Override this to add Vireo supported events
         * @param {string} eventName - The name of the event that is would be passed in to the controlEventOccurred function
         * @returns {Object} - Object with eventIndex (integer id used in LV to identify an event)
         *                  and eventDataId (EventId string property used in defining a DiagramEvent)
         */
        getLocalEventInfo(eventName) {
            return undefined;
        }
        // DO NOT USE DIRECTLY: Use getLocalBindingInfo instead for cached value
        generateLocalBindingInfo() {
            const bindingInfo = this.getBindingInfo();
            const localBindingInfo = {
                runtimePath: '',
                encodedVIName: '',
                prop: '',
                sync: false,
                dataItem: '',
                accessMode: '',
                isLatched: false
            };
            localBindingInfo.runtimePath = this.generateVireoPath();
            localBindingInfo.encodedVIName = this.getRoot().getNameVireoEncoded();
            localBindingInfo.prop = (typeof bindingInfo.prop === 'string') ? bindingInfo.prop : '';
            localBindingInfo.sync = (typeof bindingInfo.sync === 'boolean') ? bindingInfo.sync : false;
            localBindingInfo.dataItem = (typeof bindingInfo.dataItem === 'string') ? bindingInfo.dataItem : '';
            localBindingInfo.accessMode = (typeof bindingInfo.accessMode === 'string') ? bindingInfo.accessMode : '';
            localBindingInfo.isLatched = (typeof bindingInfo.isLatched === 'boolean') ? bindingInfo.isLatched : false;
            if (localBindingInfo.runtimePath === '') {
                return undefined;
            }
            return Object.freeze(localBindingInfo);
        }
        getNITypeString() {
            if (!this.niType.isAggregateType()) {
                return this.niType.getName();
            }
            return this.niType.toShortJSON();
        }
        // Control changed is only used for controls that have binding info (ie VisualModels)
        controlChanged(propertyName, newValue, oldValue) {
            const viModel = this.getRoot();
            if (this.suppressControlChanged === false) {
                viModel.controlChanged(this, propertyName, newValue, oldValue);
            }
        }
        // Event occured is only used for controls that have binding info (ie VisualModels)
        controlEventOccurred(eventType, eventData) {
            const viModel = this.getRoot();
            viModel.controlEventOccurred(this, eventType, eventData);
        }
        /**
         * Whether children of this control are positioned with flexible layout
         */
        isFlexibleLayout() {
            return false;
        }
        /**
         * Whether this control is positioned with flexible layout
         */
        isInFlexibleLayout() {
            const ownerModel = this.owner;
            if (IRootModel.isRootModel(ownerModel)) {
                return false;
            }
            else if (ownerModel instanceof NationalInstruments.HtmlVI.Models.VisualModel) {
                return ownerModel.isFlexibleLayout();
            }
            else if (ownerModel instanceof NationalInstruments.HtmlVI.Models.VisualComponentModel) {
                return false;
            }
            throw new Error('Unexpected owner model type');
        }
        // This method is meant to be overriden by any JS control model that want control over whether to update its terminal value
        // for a specific G property read/write call.
        shouldUpdateTerminal(gPropertyName) {
            return ((gPropertyName === VisualModel.VALUE_G_PROPERTY_NAME ||
                gPropertyName === VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME)) &&
                !this.bindingInfo.unplacedOrDisabled;
        }
    }
    NationalInstruments.HtmlVI.Models.VisualModel = VisualModel;
}());
//# sourceMappingURL=niVisualModel.js.map