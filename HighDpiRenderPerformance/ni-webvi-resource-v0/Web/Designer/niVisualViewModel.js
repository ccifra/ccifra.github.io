"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//****************************************
// Visual View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    // Static Private Functions
    const isInIdeMode = function (viewModel) {
        return NationalInstruments.HtmlVI.viReferenceService.getWebAppModelByVIRef(viewModel.element.viRef).updateService.isInIdeMode();
    };
    const getComputedBounds = function (viewModel) {
        const computedStyle = window.getComputedStyle(viewModel.element);
        return {
            left: parseInt(computedStyle.left),
            top: parseInt(computedStyle.top),
            width: parseInt(computedStyle.width),
            height: parseInt(computedStyle.height)
        };
    };
    class VisualViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualComponentViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('labelId');
            this.registerAutoSyncProperty('controlResizeMode');
            this.registerAutoSyncProperty('labelAlignment');
        }
        bindFocusEventListener() {
            const that = this;
            const createFocusHandler = function (isFocused) {
                return function (event) {
                    const target = event.target;
                    const isTextEdit = target instanceof HTMLTextAreaElement || (target instanceof HTMLInputElement && target.type !== 'button');
                    that.model.internalControlEventOccurred('Focus', { isFocused: isFocused, isTextEdit: isTextEdit });
                };
            };
            that.element.addEventListener('focus', createFocusHandler(true), true);
            that.element.addEventListener('blur', createFocusHandler(false), true);
        }
        getReadOnlyPropertyName() {
            return 'readOnly';
        }
        computeReadOnlyForElement() {
            if (isInIdeMode(this)) {
                return false;
            }
            return this.model.readOnly;
        }
        bindToView() {
            super.bindToView();
            const that = this;
            if (that.enableEvents() === true) {
                that.element.addEventListener('mousedown', function (e) {
                    const data = {
                        x: e.clientX,
                        y: e.clientY,
                        buttons: e.buttons,
                        count: e.detail,
                        ctrlKey: e.ctrlKey,
                        shiftKey: e.shiftKey,
                        altKey: e.altKey
                    };
                    that.model.controlEventOccurred('mousedown', data);
                });
            }
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'width':
                case 'height':
                    this.model.requestSendControlBounds();
                    this.setWidthAndHeightToRenderBuffer(this.getModelBounds(), renderBuffer);
                    break;
                case 'top':
                case 'left':
                    this.setPositionToRenderBuffer(this.getModelBounds(), renderBuffer);
                    break;
                case 'borderWidth':
                    renderBuffer.cssStyles[CSS_PROPERTIES.BORDER_WIDTH] = this.model.borderWidth;
                    break;
                case 'margin':
                    renderBuffer.cssStyles[CSS_PROPERTIES.MARGIN] = this.model.margin;
                    break;
                case 'padding':
                    renderBuffer.cssStyles[CSS_PROPERTIES.PADDING] = this.model.padding;
                    break;
                case 'visible':
                    if (!this.model.visible) {
                        renderBuffer.cssClasses.toAdd.push('ni-hidden');
                    }
                    else {
                        renderBuffer.cssClasses.toRemove.push('ni-hidden');
                    }
                    this.model.requestSendControlBounds();
                    break;
                case 'foreground':
                    renderBuffer.cssStyles[CSS_PROPERTIES.FOREGROUND_COLOR] = this.model.foreground;
                    break;
                case 'background':
                    renderBuffer.cssStyles[CSS_PROPERTIES.BACKGROUND] = this.model.background;
                    break;
                case 'fontSize':
                case 'fontWeight':
                case 'fontStyle':
                case 'fontFamily':
                case 'textDecoration':
                    // TODO mraj font should be handled by the view model, not the element
                    this.element.setFont(this.model.fontSize, this.model.fontFamily, this.model.fontWeight, this.model.fontStyle, this.model.textDecoration);
                    break;
                case 'enabled':
                    renderBuffer.properties.disabled = !this.model.enabled;
                    break;
                case 'readOnly': {
                    if (isInIdeMode(this)) {
                        if (this.model.readOnly) {
                            renderBuffer.cssClasses.toAdd.push('ni-edit-time-indicator');
                        }
                        else {
                            renderBuffer.cssClasses.toRemove.push('ni-edit-time-indicator');
                        }
                    }
                    const readOnly = this.computeReadOnlyForElement();
                    renderBuffer.properties[this.getReadOnlyPropertyName()] = readOnly;
                    break;
                }
                case 'owningControlVisible':
                    if (this.isFollower()) {
                        this.owningControlVisibleModelPropertyChanged(renderBuffer);
                    }
                    break;
                case 'labelAlignment':
                    this.model.requestSendControlBounds();
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const model = this.model, element = this.element;
            const style = window.getComputedStyle(element);
            // CSS 'used' values https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
            model.top = style.getPropertyValue('top'); // string as pixel value, ie '5px'
            model.left = style.getPropertyValue('left'); // string as pixel value
            if (this.shouldElementUseModelWidth()) {
                model.width = style.getPropertyValue('width'); // string as pixel value
            }
            if (this.shouldElementUseModelHeight()) {
                model.height = style.getPropertyValue('height'); // string as pixel value
            }
            model.borderWidth = style.getPropertyValue(CSS_PROPERTIES.BORDER_WIDTH);
            model.margin = style.getPropertyValue(CSS_PROPERTIES.MARGIN);
            model.padding = style.getPropertyValue(CSS_PROPERTIES.PADDING);
            // CSS 'resolved' values https://developer.mozilla.org/en-US/docs/Web/CSS/resolved_value
            model.fontSize = style.getPropertyValue('font-size'); // string as pixel value
            model.fontFamily = style.getPropertyValue('font-family'); // comma separated string
            model.fontWeight = style.getPropertyValue('font-weight'); // string as weight number, ie '500', https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
            model.fontStyle = style.getPropertyValue('font-style'); // string
            model.textDecoration = style.getPropertyValue('text-decoration'); // string
            model.visible = !element.classList.contains('ni-hidden'); // string
            // CSS 'resolved' but returns rgba() if alpha otherwise rgb() https://developer.mozilla.org/en-US/docs/Web/CSS/color
            model.foreground = style.getPropertyValue(CSS_PROPERTIES.FOREGROUND_COLOR);
            model.background = style.getPropertyValue(CSS_PROPERTIES.BACKGROUND);
            model.enabled = !element.disabled;
            model.readOnly = element[this.getReadOnlyPropertyName()];
            model.setBindingInfo(element.bindingInfo);
            if (this.isFollower()) {
                this.model.owningControlVisible = !this.element.classList.contains('ni-owning-control-hidden');
            }
        }
        applyModelToElement() {
            super.applyModelToElement();
            const model = this.model;
            const element = this.element;
            if (this.shouldElementUseModelPosition()) {
                element.style.top = model.top;
                element.style.left = model.left;
            }
            else {
                element.style.top = 'auto';
                element.style.left = 'auto';
            }
            if (this.shouldElementUseModelWidth()) {
                element.style.width = model.width;
            }
            else {
                element.style.width = 'auto';
            }
            if (this.shouldElementUseModelHeight()) {
                element.style.height = model.height;
            }
            else {
                element.style.height = 'auto';
            }
            element.style.setProperty(CSS_PROPERTIES.BORDER_WIDTH, model.borderWidth);
            element.style.setProperty(CSS_PROPERTIES.MARGIN, model.margin);
            element.style.setProperty(CSS_PROPERTIES.PADDING, model.padding);
            element.style.setProperty(CSS_PROPERTIES.FOREGROUND_COLOR, model.foreground);
            element.style.setProperty(CSS_PROPERTIES.BACKGROUND, model.background);
            element.style.fontSize = model.fontSize;
            element.style.fontFamily = model.fontFamily;
            element.style.fontWeight = model.fontWeight;
            element.style.fontStyle = model.fontStyle;
            element.style.textDecoration = model.textDecoration;
            if (!model.visible) {
                element.classList.add('ni-hidden');
            }
            else {
                element.classList.remove('ni-hidden');
            }
            element.bindingInfo = model.getBindingInfo();
            const readOnly = this.computeReadOnlyForElement();
            element[this.getReadOnlyPropertyName()] = readOnly;
            element.readOnly = readOnly; // US191711 : Clean up C# tests so we don't need this
            if (isInIdeMode(this) && this.model.readOnly) {
                element.classList.add('ni-edit-time-indicator');
            }
            element.disabled = !model.enabled;
            // niControlId does not get updated as a part of applyModelToElement because the control IDs are generated
            // at compile time and should never be updated at edit time.
            if (this.isFollower()) {
                this.applyOwningControlModelVisiblePropertyToElement();
            }
        }
        setPositionToRenderBuffer(bounds, renderBuffer) {
            if (this.shouldElementUseModelPosition()) {
                if (this.shouldUseTranslate()) {
                    renderBuffer.cssStyles.transform = 'translate(' + bounds.left + 'px,' + bounds.top + 'px)';
                }
                else {
                    renderBuffer.cssStyles.top = bounds.top + 'px';
                    renderBuffer.cssStyles.left = bounds.left + 'px';
                }
            }
            else {
                renderBuffer.cssStyles.top = 'auto';
                renderBuffer.cssStyles.left = 'auto';
            }
        }
        setWidthAndHeightToRenderBuffer(bounds, renderBuffer) {
            if (this.shouldElementUseModelWidth()) {
                renderBuffer.cssStyles.width = bounds.width + 'px';
            }
            else {
                renderBuffer.cssStyles.width = 'auto';
            }
            if (this.shouldElementUseModelHeight()) {
                renderBuffer.cssStyles.height = bounds.height + 'px';
            }
            else {
                renderBuffer.cssStyles.height = 'auto';
            }
        }
        getModelBounds() {
            // Assuming bounds are saved as '(\d)+px'
            return {
                left: parseInt(this.model.left),
                top: parseInt(this.model.top),
                width: parseInt(this.model.width),
                height: parseInt(this.model.height)
            };
        }
        shouldApplyDraggingStyleWithChild() {
            return false;
        }
        isFollower() {
            return false;
        }
        owningControlVisibleModelPropertyChanged(renderBuffer) {
            if (!this.model.owningControlVisible) {
                renderBuffer.cssClasses.toAdd.push('ni-owning-control-hidden');
            }
            else {
                renderBuffer.cssClasses.toRemove.push('ni-owning-control-hidden');
            }
        }
        applyOwningControlModelVisiblePropertyToElement() {
            if (!this.model.owningControlVisible) {
                this.element.classList.add('ni-owning-control-hidden');
            }
            else {
                this.element.classList.remove('ni-owning-control-hidden');
            }
        }
        *followerModels() {
            const model = this.model;
            const viModel = model.getRoot();
            const followerIds = model.followerIds;
            if (followerIds !== undefined) {
                let i = 0;
                for (i in followerIds) {
                    yield viModel.controlModels[followerIds[i]];
                }
            }
        }
        updateFollowersVisibility(visible) {
            for (const follower of this.followerModels()) {
                follower.owningControlVisible = visible;
            }
        }
        isInsideFlexibleContainer() {
            let ownerModel = this.model.owner;
            while (ownerModel !== undefined) {
                const isFlexibleContainer = ownerModel instanceof NationalInstruments.HtmlVI.Models.LayoutControlModel &&
                    ownerModel.isFlexibleLayoutRoot();
                if (!isFlexibleContainer) {
                    ownerModel = ownerModel.owner;
                }
                else {
                    return true;
                }
            }
            return false;
        }
        errorIfFlexibleContainer(gPropertyName, setCallback) {
            if (this.isInsideFlexibleContainer()) {
                throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_NOT_SUPPORTED_IN_FLEX', gPropertyName));
            }
            return setCallback();
        }
        moveFollowers(relativeLeft, relativeTop) {
            for (const follower of this.followerModels()) {
                follower.left = `${parseInt(follower.left) + relativeLeft}px`;
                follower.top = `${parseInt(follower.top) + relativeTop}px`;
            }
        }
        setSize(width, height) {
            this.model.width = `${width}px`;
            this.model.height = `${height}px`;
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.POSITION_G_PROPERTY_NAME:
                    this.errorIfFlexibleContainer(gPropertyName, () => {
                        const relativeLeft = gPropertyValue.Left - parseInt(this.model.left);
                        const relativeTop = gPropertyValue.Top - parseInt(this.model.top);
                        this.moveFollowers(relativeLeft, relativeTop);
                        this.model.left = `${gPropertyValue.Left}px`;
                        this.model.top = `${gPropertyValue.Top}px`;
                    });
                    break;
                case VisualModel.SIZE_G_PROPERTY_NAME:
                    this.errorIfFlexibleContainer(gPropertyName, () => { this.setSize(gPropertyValue.Width, gPropertyValue.Height); });
                    break;
                case VisualModel.DISABLED_G_PROPERTY_NAME: {
                    model.enabled = !gPropertyValue;
                    model.updateLabelDisabledState(gPropertyValue);
                    break;
                }
                case VisualModel.VISIBLE_G_PROPERTY_NAME:
                    model.visible = gPropertyValue;
                    this.updateFollowersVisibility(gPropertyValue);
                    break;
                case VisualModel.LABEL_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CANNOT_BE_SET', gPropertyName));
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            const that = this;
            switch (gPropertyName) {
                case VisualModel.POSITION_G_PROPERTY_NAME:
                    return this.errorIfFlexibleContainer(gPropertyName, () => ({
                        "Left": parseInt(this.model.left),
                        "Top": parseInt(this.model.top)
                    }));
                case VisualModel.SIZE_G_PROPERTY_NAME:
                    return this.errorIfFlexibleContainer(gPropertyName, function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield NationalInstruments.HtmlVI.RenderEngine.waitForFrameUpdate();
                            const computedStyle = window.getComputedStyle(that.element);
                            return {
                                "Width": parseInt(computedStyle.width),
                                "Height": parseInt(computedStyle.height)
                            };
                        });
                    });
                case VisualModel.DISABLED_G_PROPERTY_NAME:
                    return !model.enabled;
                case VisualModel.VISIBLE_G_PROPERTY_NAME:
                    return this.isFollower() ? model.visible && model.owningControlVisible : model.visible;
                case VisualModel.LABEL_G_PROPERTY_NAME: {
                    const viModel = model.getRoot();
                    if (viModel !== undefined) {
                        if (model.labelId !== '') {
                            return viModel.controlViewModels[model.labelId];
                        }
                    }
                    throw new Error(NI_SUPPORT.i18n('msg_REFERENCE_PROPERTY_NOT_AVAILABLE'), gPropertyName);
                }
                case VisualModel.TOTAL_BOUNDS_G_PROPERTY_NAME:
                    return this.errorIfFlexibleContainer(gPropertyName, function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield NationalInstruments.HtmlVI.RenderEngine.waitForFrameUpdate();
                            const totalBounds = that.getTotalBounds();
                            return totalBounds;
                        });
                    });
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
        getTotalBounds() {
            const model = this.model;
            const viModel = model.getRoot();
            const controlBounds = getComputedBounds(this);
            let minLeft = controlBounds.left;
            let minTop = controlBounds.top;
            let maxRight = minLeft + controlBounds.width;
            let maxBottom = minTop + controlBounds.height;
            model.followerIds.forEach(followerId => {
                const followerViewModel = viModel.controlViewModels[followerId];
                if (followerViewModel.model.visible) {
                    const bounds = getComputedBounds(followerViewModel);
                    minLeft = Math.min(minLeft, bounds.left);
                    minTop = Math.min(minTop, bounds.top);
                    maxRight = Math.max(maxRight, bounds.left + bounds.width);
                    maxBottom = Math.max(maxBottom, bounds.top + bounds.height);
                }
            });
            const totalBounds = {
                Left: minLeft,
                Top: minTop,
                Width: maxRight - minLeft,
                Height: maxBottom - minTop
            };
            return totalBounds;
        }
        /**
         * This method is meant to be overriden by all our JS control view models that don't want JS to sync Height
         * between the Model/ViewModel/Element layers. The default value is true.  Any control that doesn't want the
         * Height set should override and set to false.
         */
        shouldElementUseModelHeight() {
            return true;
        }
        /**
         * This method is meant to be overriden by all our JS control view models that don't want JS to sync Width
         * between the Model/ViewModel/Element layers. The default value is true.  Any control that doesn't want the
         * Width set should override and set to false.
         */
        shouldElementUseModelWidth() {
            return true;
        }
        /**
         * This method is meant to be overriden by all our JS control view models that don't want JS to sync Top/Left
         * between the Model/ViewModel/Element layers. The default value is false for any control in flexible layout,
         * true otherwise. Any control that doesn't want the Top/Left set should override and set to false.
         */
        shouldElementUseModelPosition() {
            return !this.model.isInFlexibleLayout();
        }
        shouldUseTranslate() {
            return false;
        }
    }
    NationalInstruments.HtmlVI.ViewModels.VisualViewModel = VisualViewModel;
})();
//# sourceMappingURL=niVisualViewModel.js.map