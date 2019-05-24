"use strict";
//****************************************
// GraphBase View Model
// National Instruments Copyright 2016
//****************************************
(function () {
    'use strict';
    const CartesianAxisModel = NationalInstruments.HtmlVI.Models.CartesianAxisModel;
    const CursorModel = NationalInstruments.HtmlVI.Models.CursorModel;
    const PlotModel = NationalInstruments.HtmlVI.Models.CartesianPlotModel;
    const GraphBaseModel = NationalInstruments.HtmlVI.Models.GraphBaseModel;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const axisPositions = Object.freeze({
        XAxisBottom: 'bottom',
        XAxisTop: 'top',
        YAxisLeft: 'left',
        YAxisRight: 'right'
    });
    // Static Private Functions
    const getActiveCartesianAxisViewModel = function (model, cartesianAxisModels, activeAxisIndex) {
        const rootModel = model.getRoot();
        return rootModel.controlViewModels[cartesianAxisModels[activeAxisIndex].niControlId];
    };
    class GraphBaseViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('graphRef');
        }
        // Static Public Functions
        static getAxisPositions() {
            return axisPositions;
        }
        static getChildAxisModelsWithGivenAxisPositions(model, ...axisPositionsOfXOrY) {
            return model.childModels.filter(childModel => (childModel instanceof CartesianAxisModel &&
                (axisPositionsOfXOrY.find(function (x) {
                    return x === childModel.axisPosition;
                }))));
        }
        static isActiveScaleIndexInBounds(numberOfCartesianAxisModels, activeScaleIndex) {
            if (activeScaleIndex >= 0 && activeScaleIndex < numberOfCartesianAxisModels) {
                return true;
            }
            return false;
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'plotAreaMargin':
                    renderBuffer.properties.plotAreaMargin = this.model.plotAreaMargin;
                    break;
                case 'niType':
                    renderBuffer.properties.niType = this.model.getNITypeString();
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            if (this.element.niType) {
                this.model.niType = new window.NIType(this.element.niType);
            }
        }
        applyModelToElement() {
            super.applyModelToElement(this);
            this.element.niType = this.model.getNITypeString();
        }
        bindToView() {
            const that = this;
            const insideGraphBaseEventName = 'InsideGraphBase';
            that.element.addEventListener('mouseenter', function () {
                that.model.internalControlEventOccurred(insideGraphBaseEventName, true);
            });
            that.element.addEventListener('mouseleave', function () {
                that.model.internalControlEventOccurred(insideGraphBaseEventName, false);
            });
        }
        getPlots() {
            return this.model.childModels.filter(x => (x instanceof PlotModel));
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const model = this.model;
            switch (gPropertyName) {
                case GraphBaseModel.ACTIVE_CURSOR_G_PROPERTY_NAME: {
                    const cursorChildModels = model.childModels.filter(x => (x instanceof CursorModel));
                    const cursorChildModelsLength = cursorChildModels.length;
                    if (gPropertyValue >= 0 && gPropertyValue < cursorChildModelsLength) {
                        model.activeCursor = gPropertyValue;
                    }
                    else {
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CURSOR_SET_INDEX_OUT_OF_BOUNDS', gPropertyValue, cursorChildModelsLength - 1));
                    }
                    break;
                }
                case GraphBaseModel.ACTIVE_PLOT_G_PROPERTY_NAME: {
                    const plotChildLength = this.getPlots().length;
                    if (gPropertyValue >= 0 && gPropertyValue < plotChildLength) {
                        model.activePlot = gPropertyValue;
                    }
                    else {
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_PLOT_SET_INDEX_OUT_OF_BOUNDS', gPropertyValue, plotChildLength - 1));
                    }
                    break;
                }
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    model.value = gPropertyValue;
                    break;
                case VisualModel.VALUE_SIGNALING_G_PROPERTY_NAME:
                    model.controlChanged(gPropertyValue);
                    break;
                case GraphBaseModel.ACTIVE_X_SCALE_G_PROPERTY_NAME: {
                    const cartesianAxisModels = GraphBaseViewModel.getChildAxisModelsWithGivenAxisPositions(model, axisPositions.XAxisBottom, axisPositions.XAxisTop);
                    const cartesianAxisModelsLength = cartesianAxisModels.length;
                    const activeXScaleIsInBounds = GraphBaseViewModel.isActiveScaleIndexInBounds(cartesianAxisModelsLength, gPropertyValue);
                    if (activeXScaleIsInBounds) {
                        model.activeXScale = gPropertyValue;
                    }
                    else {
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_OUT_OF_RANGE', gPropertyName, cartesianAxisModelsLength - 1));
                    }
                    break;
                }
                case GraphBaseModel.ACTIVE_Y_SCALE_G_PROPERTY_NAME: {
                    const cartesianAxisModels = GraphBaseViewModel.getChildAxisModelsWithGivenAxisPositions(model, axisPositions.YAxisLeft, axisPositions.YAxisRight);
                    const cartesianAxisModelsLength = cartesianAxisModels.length;
                    const activeYScaleIsInBounds = GraphBaseViewModel.isActiveScaleIndexInBounds(cartesianAxisModelsLength, gPropertyValue);
                    if (activeYScaleIsInBounds) {
                        model.activeYScale = gPropertyValue;
                    }
                    else {
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_OUT_OF_RANGE', gPropertyName, cartesianAxisModelsLength - 1));
                    }
                    break;
                }
                case GraphBaseModel.X_SCALE_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CANNOT_BE_SET', gPropertyName));
                case GraphBaseModel.Y_SCALE_G_PROPERTY_NAME:
                    throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CANNOT_BE_SET', gPropertyName));
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
        getGPropertyValue(gPropertyName) {
            const model = this.model;
            const viModel = model.getRoot();
            switch (gPropertyName) {
                case GraphBaseModel.CURSOR_G_PROPERTY_NAME: {
                    const cursorChildModels = model.childModels.filter(x => (x instanceof CursorModel));
                    if (model.activeCursor >= 0 && model.activeCursor < cursorChildModels.length) {
                        return viModel.controlViewModels[cursorChildModels[model.activeCursor].niControlId];
                    }
                    else {
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_CURSOR_GET_INDEX_OUT_OF_BOUNDS', gPropertyName, cursorChildModels.length));
                    }
                }
                case GraphBaseModel.PLOT_G_PROPERTY_NAME: {
                    const plotChildModels = this.getPlots();
                    if (model.activePlot >= plotChildModels.length || model.activePlot < 0) {
                        throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_PLOT_GET_INDEX_OUT_OF_BOUNDS', gPropertyName, plotChildModels.length));
                    }
                    return viModel.controlViewModels[plotChildModels[model.activePlot].niControlId];
                }
                case GraphBaseModel.ACTIVE_CURSOR_G_PROPERTY_NAME:
                    return model.activeCursor;
                case GraphBaseModel.ACTIVE_PLOT_G_PROPERTY_NAME:
                    return model.activePlot;
                case VisualModel.VALUE_G_PROPERTY_NAME:
                    return model.value;
                case GraphBaseModel.ACTIVE_X_SCALE_G_PROPERTY_NAME:
                    return model.activeXScale;
                case GraphBaseModel.ACTIVE_Y_SCALE_G_PROPERTY_NAME:
                    return model.activeYScale;
                case GraphBaseModel.X_SCALE_G_PROPERTY_NAME: {
                    const cartesianAxisModels = GraphBaseViewModel.getChildAxisModelsWithGivenAxisPositions(model, axisPositions.XAxisBottom, axisPositions.XAxisTop);
                    return getActiveCartesianAxisViewModel(model, cartesianAxisModels, model.activeXScale);
                }
                case GraphBaseModel.Y_SCALE_G_PROPERTY_NAME: {
                    const cartesianAxisModels = GraphBaseViewModel.getChildAxisModelsWithGivenAxisPositions(model, axisPositions.YAxisLeft, axisPositions.YAxisRight);
                    return getActiveCartesianAxisViewModel(model, cartesianAxisModels, model.activeYScale);
                }
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
    }
    NationalInstruments.HtmlVI.ViewModels.GraphBaseViewModel = GraphBaseViewModel;
})();
//# sourceMappingURL=niGraphBaseViewModel.js.map