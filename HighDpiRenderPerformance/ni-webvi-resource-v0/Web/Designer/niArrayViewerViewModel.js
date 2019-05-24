"use strict";
//****************************************
// Array Viewer View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const INDEX_FOR_ROW = 0;
    const INDEX_FOR_COLUMN = 1;
    const ArrayViewerModel = NationalInstruments.HtmlVI.Models.ArrayViewerModel;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    // Static Private Functions
    const getArrayViewerAndClones = function (rootArrayViewModel, arrayViewer, arrayViewerModel) {
        const arrayViewers = [arrayViewer];
        if (arrayViewerModel !== rootArrayViewModel.model) {
            // If the given arrayViewer is not the root array (i.e. array-of-arrays), get the matching clone arrayViewers from
            // all of the other cells too
            Array.prototype.push.apply(arrayViewers, rootArrayViewModel._viewModelData[arrayViewer.niControlId].getClones());
        }
        return arrayViewers;
    };
    const arrayElementSizeChanged = function (arrayElementViewModel, rootArrayViewModel) {
        let i, renderBuffer;
        const arrayElementModel = arrayElementViewModel.model;
        const arrayModel = arrayElementModel.getOwner();
        const arrayElement = arrayElementViewModel.element.parentElement;
        const arrayViewers = getArrayViewerAndClones(rootArrayViewModel, arrayElement, arrayModel);
        for (i = 0; i < arrayViewers.length; i++) {
            renderBuffer = NationalInstruments.HtmlVI.RenderEngine.getOrAddRenderBuffer(arrayViewers[i]);
            renderBuffer.properties.elementSize = { width: parseInt(arrayElementModel.width), height: parseInt(arrayElementModel.height) };
            NationalInstruments.HtmlVI.RenderEngine.enqueueDomUpdate(arrayViewers[i]);
        }
    };
    const copyRenderBuffer = function (srcElement, srcRenderBuffer, destRenderBuffer, isArrayElement) {
        let i, newStyle, newAttr, newProp;
        for (i = 0; i < srcRenderBuffer.cssClasses.toAdd.length; i++) {
            destRenderBuffer.cssClasses.toAdd[i] = srcRenderBuffer.cssClasses.toAdd[i];
        }
        for (i = 0; i < srcRenderBuffer.cssClasses.toRemove.length; i++) {
            destRenderBuffer.cssClasses.toRemove[i] = srcRenderBuffer.cssClasses.toRemove[i];
        }
        for (newStyle in srcRenderBuffer.cssStyles) {
            if (srcRenderBuffer.cssStyles.hasOwnProperty(newStyle)) {
                if (!(isArrayElement && (newStyle === 'left' || newStyle === 'top'))) {
                    destRenderBuffer.cssStyles[newStyle] = srcRenderBuffer.cssStyles[newStyle];
                }
            }
        }
        for (newAttr in srcRenderBuffer.attributes) {
            if (srcRenderBuffer.attributes.hasOwnProperty(newAttr)) {
                destRenderBuffer.attributes[newAttr] = srcRenderBuffer.attributes[newAttr];
            }
        }
        // TODO: This code won't handle property values that can be objects (like a numeric with {numberValue:1} - the
        // clones will end up sharing that same object. For now this is fine, because we handle template value changes
        // another way (see the 'setDefaultValue' code below).
        for (newProp in srcRenderBuffer.properties) {
            if (srcRenderBuffer.properties.hasOwnProperty(newProp)) {
                if (srcElement.valuePropertyDescriptor !== undefined &&
                    (newProp === srcElement.valuePropertyDescriptor.propertyName ||
                        newProp === srcElement.valuePropertyDescriptor.propertyNameNonSignaling) &&
                    srcElement.parentElement instanceof NationalInstruments.HtmlVI.Elements.ArrayViewer) {
                    continue;
                }
                destRenderBuffer.properties[newProp] = srcRenderBuffer.properties[newProp];
            }
        }
    };
    const updateElementsFromRenderBuffer = function (elements, renderBuffer, srcElement, isArrayElement) {
        let curBuffer, i;
        for (i = 0; i < elements.length; i++) {
            curBuffer = NationalInstruments.HtmlVI.RenderEngine.getOrAddRenderBuffer(elements[i]);
            copyRenderBuffer(srcElement, renderBuffer, curBuffer, isArrayElement);
            NationalInstruments.HtmlVI.RenderEngine.enqueueDomUpdate(elements[i]);
        }
    };
    const elementFontChanged = function (elements, childViewModel) {
        let i;
        const fontSize = childViewModel.model.fontSize;
        const fontFamily = childViewModel.model.fontFamily;
        const fontWeight = childViewModel.model.fontWeight;
        const fontStyle = childViewModel.model.fontStyle;
        const textDecoration = childViewModel.model.textDecoration;
        for (i = 0; i < elements.length; i++) {
            elements[i].setFont(fontSize, fontFamily, fontWeight, fontStyle, textDecoration);
        }
    };
    const findRootArrayViewModel = function (controlModel, viRef) {
        let currControlModel = controlModel, rootArrayModel = null;
        while (!currControlModel.isDataItemBoundControl()) {
            if (currControlModel instanceof NationalInstruments.HtmlVI.Models.ArrayViewerModel) {
                rootArrayModel = currControlModel;
            }
            currControlModel = currControlModel.getOwner();
        }
        if (currControlModel instanceof NationalInstruments.HtmlVI.Models.ArrayViewerModel) {
            rootArrayModel = currControlModel;
        }
        const viModel = NationalInstruments.HtmlVI.viReferenceService.getVIModelByVIRef(viRef);
        const rootArrayViewModel = viModel.getControlViewModel(rootArrayModel.niControlId);
        return rootArrayViewModel;
    };
    const createElementShims = function (rootArrayViewModel, childViewModel) {
        const originalUserInteractionChanged = childViewModel.userInteractionChanged;
        const originalModelPropertyChanged = childViewModel.modelPropertyChanged;
        const originalChildViewModelAdded = childViewModel.onChildViewModelAdded;
        const originalChildViewModelRemoved = childViewModel.onChildViewModelRemoved;
        const owner = childViewModel.model.getOwner();
        const isArrayElement = owner instanceof NationalInstruments.HtmlVI.Models.ArrayViewerModel;
        return {
            setCallback: function () {
                childViewModel.userInteractionChanged = function (newState, operationKind) {
                    const viewModelData = rootArrayViewModel._viewModelData[childViewModel.element.niControlId];
                    let updateClonesAfterInteractionEnded = false;
                    if (newState === 'start') {
                        viewModelData.suppressBoundsChanges = true;
                    }
                    else if (newState === 'end') {
                        viewModelData.suppressBoundsChanges = false;
                        if (isArrayElement) {
                            arrayElementSizeChanged(childViewModel, rootArrayViewModel);
                            rootArrayViewModel.element.updateTemplateCss(childViewModel.element);
                        }
                        else {
                            if (viewModelData.recreateCellsOnUserInteractionEnd === true) {
                                rootArrayViewModel.recreateAllCells();
                                viewModelData.recreateCellsOnUserInteractionEnd = false;
                            }
                            else {
                                updateClonesAfterInteractionEnded = true;
                            }
                        }
                    }
                    originalUserInteractionChanged.call(childViewModel, newState, operationKind);
                    //The original userInteractionChanged is called (newState = "end") to commit the bounds change.
                    // We update the clones with those CSS style changes for left / top / width / height at that point.
                    if (updateClonesAfterInteractionEnded) {
                        const renderBuffer = NationalInstruments.HtmlVI.RenderEngine.getOrAddRenderBuffer(childViewModel.element);
                        if (Object.keys(renderBuffer.cssStyles).length !== 0) {
                            updateElementsFromRenderBuffer(viewModelData.getClones(), renderBuffer, childViewModel.element);
                        }
                        rootArrayViewModel.element.updateTemplateCss(childViewModel.element);
                    }
                };
                childViewModel.modelPropertyChanged = function (propertyName) {
                    const viewModelData = rootArrayViewModel._viewModelData[childViewModel.element.niControlId];
                    let elements;
                    let focusedClone = null;
                    if (viewModelData.suppressBoundsChanges && childViewModel.element._niFocusedCloneId !== undefined) {
                        focusedClone = document.querySelector('[ni-control-id=\'' + childViewModel.element._niFocusedCloneId + '\']');
                    }
                    const renderBuffer = originalModelPropertyChanged.call(childViewModel, propertyName);
                    if (propertyName === 'left' || propertyName === 'top' || propertyName === 'width' || propertyName === 'height') {
                        if (isArrayElement) {
                            if ((propertyName === 'width' || propertyName === 'height') && !viewModelData.suppressBoundsChanges) {
                                arrayElementSizeChanged(childViewModel, rootArrayViewModel);
                                rootArrayViewModel.element.updateTemplateCss(childViewModel.element);
                            }
                        }
                        else {
                            if (viewModelData.suppressBoundsChanges) {
                                elements = [];
                                if (focusedClone !== null) {
                                    elements[0] = focusedClone;
                                }
                            }
                            else {
                                elements = viewModelData.getClones();
                                rootArrayViewModel.element.updateTemplateCss(childViewModel.element);
                            }
                            updateElementsFromRenderBuffer(elements, renderBuffer, childViewModel.element);
                        }
                    }
                    else if (propertyName === 'fontSize' || propertyName === 'fontFamily' || propertyName === 'fontWeight' || propertyName === 'fontStyle' || propertyName === 'textDecoration') {
                        elementFontChanged(viewModelData.getClones(), childViewModel);
                        rootArrayViewModel.element.updateTemplateCss(childViewModel.element);
                    }
                    else {
                        // If the value of the template control changed, we explicitly do nothing since defaultElementValue is handled by modelPropertyChanged.
                        if (childViewModel.element.valuePropertyDescriptor === undefined ||
                            (propertyName !== childViewModel.element.valuePropertyDescriptor.propertyName &&
                                propertyName !== childViewModel.element.valuePropertyDescriptor.propertyNameNonSignaling) ||
                            (childViewModel.element.parentElement instanceof NationalInstruments.HtmlVI.Elements.ArrayViewer) === false) {
                            elements = viewModelData.getClones();
                            updateElementsFromRenderBuffer(elements, renderBuffer, childViewModel.element, isArrayElement);
                        }
                    }
                    return renderBuffer;
                };
                childViewModel.onChildViewModelAdded = function (viewModel) {
                    originalChildViewModelAdded.call(childViewModel, viewModel);
                    rootArrayViewModel.initializeElementViewModel(viewModel);
                    const viewModelData = rootArrayViewModel._viewModelData[viewModel.element.niControlId];
                    const viViewModel = NationalInstruments.HtmlVI.viReferenceService.getVIViewModelByVIRef(viewModel.element.viRef);
                    if (viewModel.element._modelMetadata === undefined || viewModel.element._modelMetadata.initialLoad !== true) {
                        if (viViewModel.isUserInteracting(viewModel.element.niControlId)) {
                            viewModelData.recreateCellsOnUserInteractionEnd = true;
                            // Optimally we would just add a copy of the new control in all of the array cells.
                            // For now, we reinitialize the array (based on the current state of the template) when a descendant is added or removed,
                            // which is much simpler to implement, but also worse performance.
                            // We'll only update the focused cell at first, then the full array will be refreshed on user interaction end.
                            window.requestAnimationFrame(function () {
                                rootArrayViewModel.element.recreateCells(false);
                            });
                        }
                        else {
                            // A child has been added, after initial load, and not part of a user interaction. This is probably undo / redo, so we need to
                            // immediately update the whole array.
                            window.requestAnimationFrame(function () {
                                rootArrayViewModel.element.recreateCells(true);
                            });
                        }
                    }
                };
                childViewModel.onChildViewModelRemoved = function (viewModel) {
                    let i;
                    const viewModelData = rootArrayViewModel._viewModelData[viewModel.element.niControlId];
                    const elements = viewModelData.getClones();
                    // If this is for an array, niArrayViewerViewModel.onChildViewModelRemoved is called here (when we call the original function.)
                    // That will call removeShim on the child, and remove it from the viewModelData map. So, for arrays, we skip doing those things
                    // later in this function.
                    originalChildViewModelRemoved.call(childViewModel, viewModel);
                    for (i = 0; i < elements.length; i++) {
                        elements[i].parentElement.removeChild(elements[i]);
                    }
                    if (!(childViewModel.model instanceof NationalInstruments.HtmlVI.Models.ArrayViewerModel)) {
                        viewModelData.shim.removeShim();
                        rootArrayViewModel._viewModelData[viewModel.element.niControlId] = undefined;
                    }
                };
            },
            removeShim: function () {
                childViewModel.userInteractionChanged = originalUserInteractionChanged;
                childViewModel.modelPropertyChanged = originalModelPropertyChanged;
                childViewModel.onChildViewModelAdded = originalChildViewModelAdded;
                childViewModel.onChildViewModelRemoved = originalChildViewModelRemoved;
            }
        };
    };
    class ArrayViewerViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        // Constructor Function
        constructor(element, model) {
            super(element, model);
            // Public Instance Properties
            // None
            // Private Instance Properties
            this._viewModelData = {};
            this._recreateCellsRequested = false;
            this._isUserInteracting = false;
            this.registerAutoSyncProperty('dimensions');
            this.registerAutoSyncProperty('indexEditorWidth');
            this.registerAutoSyncProperty('indexVisibility');
            this.registerAutoSyncProperty('rowsAndColumns');
            this.registerAutoSyncProperty('orientation');
            this.registerAutoSyncProperty('verticalScrollbarVisibility');
            this.registerAutoSyncProperty('horizontalScrollbarVisibility');
            this.registerAutoSyncProperty('focusedCell');
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName), that = this;
            let i;
            switch (propertyName) {
                case 'value':
                    // postRender() updates these properties on the element the same time as the other renderBuffer updates (which are done
                    // all at once to minimize layout thrashing). We're not using the renderBuffer directly because currently, if dimensions/
                    // values are changing, dimensions must be set first for the array-viewer to behave correctly.
                    renderBuffer.postRender.value = function () {
                        that.element.dimensions = that.model.dimensions;
                        that.element.valueNonSignaling = that.model.value;
                    };
                    break;
                case 'niType':
                    renderBuffer.properties.niType = this.model.getNITypeString();
                    break;
                case 'defaultElementValue': {
                    const rootArrayViewModel = findRootArrayViewModel(this.model, this.element.viRef);
                    const arrayViewers = getArrayViewerAndClones(rootArrayViewModel, this.element, this.model);
                    for (i = 0; i < arrayViewers.length; i++) {
                        arrayViewers[i].setDefaultValue(this.model.defaultElementValue);
                    }
                    break;
                }
            }
            return renderBuffer;
        }
        recreateAllCells() {
            const that = this;
            if (!this._recreateCellsRequested) {
                this._recreateCellsRequested = true;
                window.requestAnimationFrame(function () {
                    that.element.recreateCells(true);
                    that._recreateCellsRequested = false;
                });
            }
        }
        bindToView() {
            super.bindToView();
            const that = this;
            let viModel, childModel;
            that.bindFocusEventListener();
            that.element.addEventListener('value-changed', function (evt) {
                let newValue, oldValue;
                if (evt.target === that.element) {
                    newValue = evt.detail.newValue;
                    oldValue = evt.detail.oldValue;
                    that.model.controlChanged(newValue, oldValue);
                }
            });
            that.element.addEventListener('array-size-changed', function (evt) {
                const ideEditPanelLocation = NationalInstruments.HtmlVI.WebApplicationStates.PanelLocationEnum.IDE_EDIT;
                if (NationalInstruments.HtmlVI.viReferenceService.getWebAppModelByVIRef(this.viRef).location !== ideEditPanelLocation) {
                    if (evt.target === that.element) {
                        that.model.height = evt.detail.height + 'px';
                        that.model.width = evt.detail.width + 'px';
                    }
                }
            });
            that.element.addEventListener('scroll-changed', function (evt) {
                if (evt.target === that.element) {
                    that.model.scrollChanged(evt.detail.indices);
                }
            });
            if (that.model.childModels.length > 0) {
                childModel = that.model.childModels[0];
                viModel = NationalInstruments.HtmlVI.viReferenceService.getVIModelByVIRef(that.element.viRef);
                that.initializeArrayElementViewModel(viModel.getControlViewModel(childModel.niControlId));
            }
        }
        userInteractionChanged(newState, operationKind) {
            super.userInteractionChanged(newState, operationKind);
            if (newState === 'start') {
                this._isUserInteracting = true;
            }
            else if (newState === 'end') {
                this._isUserInteracting = false;
                if (this.model.childModels.length > 0) {
                    const childModel = this.model.childModels[0];
                    const viRef = this.element.viRef;
                    const viModel = NationalInstruments.HtmlVI.viReferenceService.getVIModelByVIRef(viRef);
                    const childViewModel = viModel.getControlViewModel(childModel.niControlId);
                    const rootArrayViewModel = findRootArrayViewModel(childModel, viRef);
                    arrayElementSizeChanged(childViewModel, rootArrayViewModel);
                }
            }
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.value = this.element.value;
            this.model.niType = new window.NIType(this.element.niType);
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.niType = this.model.getNITypeString();
            this.element.valueNonSignaling = this.model.value;
        }
        onChildViewModelAdded(childViewModel) {
            super.onChildViewModelAdded(childViewModel);
            this.initializeArrayElementViewModel(childViewModel);
        }
        onChildViewModelRemoved(childViewModel) {
            const rootArrayViewModel = findRootArrayViewModel(childViewModel.model, this.element.viRef);
            const viewModelData = rootArrayViewModel._viewModelData[childViewModel.element.niControlId];
            viewModelData.shim.removeShim();
            rootArrayViewModel._viewModelData[childViewModel.element.niControlId] = undefined;
        }
        initializeArrayElementViewModel(childViewModel) {
            const rootArrayViewModel = findRootArrayViewModel(childViewModel.model, this.element.viRef);
            if (rootArrayViewModel === this) {
                this.initializeElementViewModel(childViewModel);
            }
        }
        initializeElementViewModel(childViewModel) {
            let i, curChild, viModel, shim, curViewModel, childModels, viewModelData;
            if (childViewModel instanceof NationalInstruments.HtmlVI.ViewModels.VisualViewModel) {
                shim = createElementShims(this, childViewModel);
                shim.setCallback();
                viewModelData = {};
                viewModelData.shim = shim;
                viewModelData.cssCloneSelector = this.element.getFullCssSelectorForNIVisual(childViewModel.element);
                viewModelData.getClones = function () {
                    const results = document.querySelectorAll(viewModelData.cssCloneSelector);
                    return results;
                };
                this._viewModelData[childViewModel.model.niControlId] = viewModelData;
                childModels = Array.prototype.slice.call(childViewModel.model.childModels);
                for (i = 0; i < childModels.length; i++) {
                    curChild = childModels[i];
                    viModel = NationalInstruments.HtmlVI.viReferenceService.getVIModelByVIRef(this.element.viRef);
                    curViewModel = viModel.getControlViewModel(curChild.niControlId);
                    this.initializeElementViewModel(curViewModel);
                }
            }
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.SIZE_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CANNOT_BE_SET', gPropertyName));
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.value = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    {
                        const oldValue = model.value;
                        model.controlChanged(gPropertyValue, oldValue);
                        break;
                    }
                case ArrayViewerModel.VISIBLE_ROWS_G_PROPERTY_NAME:
                    {
                        const currentVisibleColumnsValue = parseRowsAndColumns(model.rowsAndColumns, INDEX_FOR_COLUMN);
                        if (currentVisibleColumnsValue > 1 && model.dimensions === 1) {
                            model.orientation = "vertical";
                            model.rowsAndColumns = gPropertyValue + ",1";
                        }
                        else {
                            model.rowsAndColumns = gPropertyValue + "," + currentVisibleColumnsValue;
                        }
                        break;
                    }
                case ArrayViewerModel.VISIBLE_COLUMNS_G_PROPERTY_NAME:
                    {
                        const currentVisibleRowsValue = parseRowsAndColumns(model.rowsAndColumns, INDEX_FOR_ROW);
                        if (currentVisibleRowsValue > 1 && model.dimensions === 1) {
                            model.orientation = "horizontal";
                            model.rowsAndColumns = "1," + gPropertyValue;
                        }
                        else {
                            model.rowsAndColumns = currentVisibleRowsValue + "," + gPropertyValue;
                        }
                        break;
                    }
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.value;
                case ArrayViewerModel.VISIBLE_ROWS_G_PROPERTY_NAME:
                    return parseRowsAndColumns(model.rowsAndColumns, INDEX_FOR_ROW);
                case ArrayViewerModel.VISIBLE_COLUMNS_G_PROPERTY_NAME:
                    return parseRowsAndColumns(model.rowsAndColumns, INDEX_FOR_COLUMN);
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    function parseRowsAndColumns(rowsAndColumns, index) {
        let indices;
        if (typeof rowsAndColumns === 'string' && rowsAndColumns.length > 0) {
            indices = rowsAndColumns.split(',');
            if (indices.length === 2) {
                return parseInt(indices[index]);
            }
            else {
                throw new Error(NI_SUPPORT.i18n('msg_INVALID_FORMAT', 'rowsAndColumns', '\'row,column \''));
            }
        }
        else {
            throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_TYPE', typeof rowsAndColumns, 'string'));
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(ArrayViewerViewModel, NationalInstruments.HtmlVI.Elements.ArrayViewer, NationalInstruments.HtmlVI.Models.ArrayViewerModel);
    NationalInstruments.HtmlVI.ViewModels.ArrayViewerViewModel = ArrayViewerViewModel;
})();
//# sourceMappingURL=niArrayViewerViewModel.js.map