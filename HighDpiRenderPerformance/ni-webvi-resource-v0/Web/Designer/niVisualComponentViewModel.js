"use strict";
//****************************************
// Visual Component View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    // Static Private Variables
    const USER_INTERACTION_STATE_ENUM = NationalInstruments.HtmlVI.EditorInteractionStates.UserInteractionState;
    const INTERACTIVE_OPERATION_KIND_ENUM = NationalInstruments.HtmlVI.EditorInteractionStates.InteractiveOperationKind;
    class VisualComponentViewModel extends NationalInstruments.HtmlVI.ViewModels.NIViewModel {
        // Constructor Function
        constructor(element, model) {
            super(element, model);
            if (this.model instanceof NationalInstruments.HtmlVI.Models.VisualComponentModel === false) {
                throw new Error(NI_SUPPORT.i18n('msg_INVALID_VI_MODEL'));
            }
            if (!NI_SUPPORT.isElement(this.element)) {
                throw new Error(NI_SUPPORT.i18n('msg_INVALID_ELEMENT'));
            }
            // Public Instance Properties
            // None
            // Private Instance Properties
            this._needsResizeHack = false;
        }
        updateModelCustomClasses() {
            this.model.customClasses = [];
            this.element.classList.forEach(className => {
                if (!className.startsWith('ni-') && !className.startsWith('jqx-')) {
                    this.model.customClasses.push(className);
                }
            });
        }
        // Public Prototype Methods
        enableResizeHack() {
            this._needsResizeHack = true;
        }
        shouldApplyDraggingStyleWithChild() {
            return false;
        }
        // Called by niEditorUpdateService
        userInteractionChanged(newState, operationKind) {
            const renderBuffer = NationalInstruments.HtmlVI.RenderEngine.getOrAddRenderBuffer(this.element);
            const isMoveOrCreate = operationKind === INTERACTIVE_OPERATION_KIND_ENUM.MOVE ||
                operationKind === INTERACTIVE_OPERATION_KIND_ENUM.CREATE;
            let parentElementRenderBuffer;
            const parentViewModel = this.getOwnerViewModel();
            if (parentViewModel instanceof NationalInstruments.HtmlVI.ViewModels.VisualComponentViewModel &&
                parentViewModel.shouldApplyDraggingStyleWithChild()) {
                parentElementRenderBuffer = NationalInstruments.HtmlVI.RenderEngine.getOrAddRenderBuffer(parentViewModel.element);
            }
            if (newState === USER_INTERACTION_STATE_ENUM.END) {
                if (isMoveOrCreate) {
                    renderBuffer.cssClasses.toRemove.push('ni-is-being-dragged');
                    if (parentElementRenderBuffer) {
                        parentElementRenderBuffer.cssClasses.toRemove.push('ni-is-being-dragged');
                    }
                }
                renderBuffer.cssClasses.toRemove.push('ni-will-change-position');
            }
            else if (newState === USER_INTERACTION_STATE_ENUM.START) {
                if (isMoveOrCreate) {
                    renderBuffer.cssClasses.toAdd.push('ni-is-being-dragged');
                    if (parentElementRenderBuffer) {
                        parentElementRenderBuffer.cssClasses.toAdd.push('ni-is-being-dragged');
                    }
                }
                renderBuffer.cssClasses.toAdd.push('ni-will-change-position');
            }
            this.applyElementChanges();
            if (parentElementRenderBuffer) {
                parentViewModel.applyElementChanges();
            }
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.followerIds = JSON.parse(this.element.followerIds);
            this.updateModelCustomClasses();
            if (this.model.niControlId !== this.element.niControlId) {
                throw new Error('The element and model association is incorrect; element and model ids do not match');
            }
        }
        applyModelToElement() {
            super.applyModelToElement();
            const element = this.element;
            const model = this.model;
            if (model.customClasses.length > 0) {
                model.customClasses.forEach(function (className) {
                    element.classList.add(className);
                });
            }
            element.followerIds = JSON.stringify(model.followerIds);
            if (model.niControlId !== element.niControlId) {
                throw new Error('The element and model association is incorrect; element and model ids do not match');
            }
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                /*
                    Note: Current handling of model property change is triggered only at edit time right now.
                    We have to change our scheme of handling custom classes if we expose custom classes get/set via property node.
                    Custom class added through JSLI etc.. will be lost since we would reset classes other than 'ni-' and 'jqx-'
                    If we need to include programatic support for adding/modifying clustom classes we need a way to differentiate:
                    1. Restricted classes
                    2. Edit time configured classes
                    3. Classes added programtically via JSLI (Dynamic classes).

                    Also, it is possible for quickly updating messages to not take into account existing changes in the render buffer
                    which should be addressed before implementing as a property node.
                */
                case 'customClasses': {
                    const classes = this.model.customClasses;
                    this.element.classList.forEach(className => {
                        if (!classes.includes(className) && !(className.startsWith('ni-') || className.startsWith('jqx-'))) {
                            renderBuffer.cssClasses.toRemove.push(className);
                        }
                    });
                    classes.forEach(className => {
                        if (className !== "") {
                            renderBuffer.cssClasses.toAdd.push(className);
                        }
                    });
                    break;
                }
            }
            return renderBuffer;
        }
        onChildViewModelAdded(childViewModel) {
        }
        onChildViewModelRemoved(childViewModel) {
        }
        getOwnerViewModel() {
            const rootModel = this.model.getRoot();
            return rootModel.getControlViewModel(this.model.getOwner().niControlId);
        }
    }
    NationalInstruments.HtmlVI.ViewModels.VisualComponentViewModel = VisualComponentViewModel;
})();
//# sourceMappingURL=niVisualComponentViewModel.js.map