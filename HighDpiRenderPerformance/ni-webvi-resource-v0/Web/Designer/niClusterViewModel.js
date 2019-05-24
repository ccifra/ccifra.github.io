"use strict";
//****************************************
// Cluster View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Variables
    const INTERACTIVE_OPERATION_KIND_ENUM = NationalInstruments.HtmlVI.EditorInteractionStates.InteractiveOperationKind;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class ClusterViewModel extends NationalInstruments.HtmlVI.ViewModels.LayoutControlViewModel {
        // Public Prototype Methods
        bindToView() {
            super.bindToView();
            const that = this;
            that.element.addEventListener('value-changed', function (evt) {
                let newValue, oldValue;
                if (evt.target === that.element) {
                    newValue = evt.detail.newValue;
                    oldValue = evt.detail.oldValue;
                    that.model.controlChanged(newValue, oldValue);
                }
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'value':
                    renderBuffer.properties.valueNonSignaling = this.model.value;
                    break;
                case 'niType':
                    renderBuffer.properties.niType = this.model.getNITypeString();
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.niType = new window.NIType(this.element.niType);
            this.model.value = this.element.value;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.niType = this.model.getNITypeString();
            this.element.valueNonSignaling = this.model.value;
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.value = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    {
                        const oldValue = model.value;
                        model.controlChanged(gPropertyValue, oldValue);
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
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
        userInteractionChanged(newState, operationKind) {
            super.userInteractionChanged(newState, operationKind);
            const isMoveOrCreate = operationKind === INTERACTIVE_OPERATION_KIND_ENUM.MOVE ||
                operationKind === INTERACTIVE_OPERATION_KIND_ENUM.CREATE;
            if (isMoveOrCreate) {
                const renderBuffer = NationalInstruments.HtmlVI.RenderEngine.getOrAddRenderBuffer(this.element);
                const modelBounds = this.getModelBounds();
                this.setWidthAndHeightToRenderBuffer(modelBounds, renderBuffer);
                this.setPositionToRenderBuffer(modelBounds, renderBuffer);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(ClusterViewModel, NationalInstruments.HtmlVI.Elements.Cluster, NationalInstruments.HtmlVI.Models.ClusterModel);
    NationalInstruments.HtmlVI.ViewModels.ClusterViewModel = ClusterViewModel;
})();
//# sourceMappingURL=niClusterViewModel.js.map