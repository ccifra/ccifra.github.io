"use strict";
//****************************************
// CartesianPlot View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const MathHelpers = NationalInstruments.HtmlVI.MathHelpers;
    const PlotRendererModel = NationalInstruments.HtmlVI.Models.PlotRendererModel;
    const CartesianPlotModel = NationalInstruments.HtmlVI.Models.CartesianPlotModel;
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const ColorHelpers = NationalInstruments.HtmlVI.ValueConverters.ColorValueConverters;
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    class CartesianPlotViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('label');
            this.registerAutoSyncProperty('show');
            this.registerAutoSyncProperty('xaxis');
            this.registerAutoSyncProperty('yaxis');
            this.registerAutoSyncProperty('enableHover');
            this.registerAutoSyncProperty('hoverFormat');
        }
        getGPropertyValue(gPropertyName) {
            const GraphBaseViewModel = NationalInstruments.HtmlVI.ViewModels.GraphBaseViewModel;
            const model = this.model;
            const graphBaseModel = model.owner;
            const axisPositions = GraphBaseViewModel.getAxisPositions();
            const plotRendererModel = model.childModels[0];
            switch (gPropertyName) {
                case CartesianPlotModel.BAR_WIDTH_G_PROPERTY_NAME:
                    return plotRendererModel.barWidth;
                case CartesianPlotModel.COLOR_G_PROPERTY_NAME:
                    return ColorHelpers.rgbaToInteger(plotRendererModel.lineStroke);
                case CartesianPlotModel.NAME_G_PROPERTY_NAME:
                    return model.label;
                case CartesianPlotModel.LINE_WIDTH_G_PROPERTY_NAME:
                    return plotRendererModel.lineWidth;
                case CartesianPlotModel.LINE_STYLE_G_PROPERTY_NAME:
                    {
                        const lineStyleOptions = PlotRendererModel.LINE_STYLE_OPTIONS;
                        return lineStyleOptions.indexOf(plotRendererModel.lineStyle);
                    }
                case CartesianPlotModel.FILL_STYLE_G_PROPERTY_NAME:
                    {
                        const fillStyleOptions = PlotRendererModel.FILL_STYLE_OPTIONS;
                        return fillStyleOptions.indexOf(plotRendererModel.areaBaseLine);
                    }
                case CartesianPlotModel.POINT_SHAPE_G_PROPERTY_NAME:
                    {
                        const pointShapeOptions = PlotRendererModel.POINT_SHAPE_OPTIONS;
                        return pointShapeOptions.indexOf(plotRendererModel.pointShape);
                    }
                case VisualModel.VISIBLE_G_PROPERTY_NAME:
                    {
                        return model.show;
                    }
                case CartesianPlotModel.X_AXIS_INDEX_G_PROPERTY_NAME:
                    {
                        const cartesianAxisModels = GraphBaseViewModel.getChildAxisModelsWithGivenAxisPositions(graphBaseModel, axisPositions.XAxisBottom, axisPositions.XAxisTop);
                        return cartesianAxisModels.findIndex(function (cartesianAxisModel) {
                            return cartesianAxisModel.niControlId === model.xaxis;
                        });
                    }
                case CartesianPlotModel.Y_AXIS_INDEX_G_PROPERTY_NAME:
                    {
                        const cartesianAxisModels = GraphBaseViewModel.getChildAxisModelsWithGivenAxisPositions(graphBaseModel, axisPositions.YAxisLeft, axisPositions.YAxisRight);
                        return cartesianAxisModels.findIndex(function (cartesianAxisModel) {
                            return cartesianAxisModel.niControlId === model.yaxis;
                        });
                    }
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            const GraphBaseViewModel = NationalInstruments.HtmlVI.ViewModels.GraphBaseViewModel;
            const model = this.model;
            const graphBaseModel = model.owner;
            const axisPositions = GraphBaseViewModel.getAxisPositions();
            const plotRendererModel = model.childModels[0];
            switch (gPropertyName) {
                case CartesianPlotModel.BAR_WIDTH_G_PROPERTY_NAME:
                    plotRendererModel.barWidth = gPropertyValue < 0 ? 0 : gPropertyValue;
                    break;
                case CartesianPlotModel.COLOR_G_PROPERTY_NAME:
                    plotRendererModel.lineStroke = ColorHelpers.integerToRGBA(gPropertyValue);
                    break;
                case CartesianPlotModel.NAME_G_PROPERTY_NAME:
                    model.label = gPropertyValue;
                    break;
                case CartesianPlotModel.LINE_WIDTH_G_PROPERTY_NAME:
                    {
                        const min = PlotRendererModel.MIN_LINE_WIDTH;
                        const max = PlotRendererModel.MAX_LINE_WIDTH;
                        plotRendererModel.lineWidth = MathHelpers.clamp(gPropertyValue, min, max);
                        break;
                    }
                case CartesianPlotModel.LINE_STYLE_G_PROPERTY_NAME:
                    {
                        const lineStyleOptions = PlotRendererModel.LINE_STYLE_OPTIONS;
                        plotRendererModel.lineStyle = lineStyleOptions[MathHelpers.clamp(gPropertyValue, 0, lineStyleOptions.length - 1)];
                        break;
                    }
                case CartesianPlotModel.FILL_STYLE_G_PROPERTY_NAME:
                    {
                        const fillStyleOptions = PlotRendererModel.FILL_STYLE_OPTIONS;
                        // The first option in fillStyleOptions is none, and whenever the value is out of bound, it clamps to valid value other then none,
                        // that's why areaBaseLine gets clamped from 1 to the number of options.
                        plotRendererModel.areaBaseLine = fillStyleOptions[MathHelpers.clamp(gPropertyValue, 1, fillStyleOptions.length - 1)];
                        break;
                    }
                case CartesianPlotModel.POINT_SHAPE_G_PROPERTY_NAME:
                    {
                        const pointShapeOptions = PlotRendererModel.POINT_SHAPE_OPTIONS;
                        plotRendererModel.pointShape = pointShapeOptions[MathHelpers.clamp(gPropertyValue, 0, pointShapeOptions.length - 1)];
                        break;
                    }
                case VisualModel.VISIBLE_G_PROPERTY_NAME:
                    {
                        model.show = gPropertyValue;
                        break;
                    }
                case CartesianPlotModel.X_AXIS_INDEX_G_PROPERTY_NAME:
                    {
                        const cartesianAxisModels = GraphBaseViewModel.getChildAxisModelsWithGivenAxisPositions(graphBaseModel, axisPositions.XAxisBottom, axisPositions.XAxisTop);
                        const cartesianAxisModelsLength = cartesianAxisModels.length;
                        const activeXScaleIsInBounds = GraphBaseViewModel.isActiveScaleIndexInBounds(cartesianAxisModelsLength, gPropertyValue);
                        if (activeXScaleIsInBounds) {
                            model.xaxis = cartesianAxisModels[gPropertyValue].niControlId;
                        }
                        else {
                            throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_OUT_OF_RANGE', gPropertyName, cartesianAxisModelsLength - 1));
                        }
                        break;
                    }
                case CartesianPlotModel.Y_AXIS_INDEX_G_PROPERTY_NAME:
                    {
                        const cartesianAxisModels = GraphBaseViewModel.getChildAxisModelsWithGivenAxisPositions(graphBaseModel, axisPositions.YAxisLeft, axisPositions.YAxisRight);
                        const cartesianAxisModelsLength = cartesianAxisModels.length;
                        const activeYScaleIsInBounds = GraphBaseViewModel.isActiveScaleIndexInBounds(cartesianAxisModelsLength, gPropertyValue);
                        if (activeYScaleIsInBounds) {
                            model.yaxis = cartesianAxisModels[gPropertyValue].niControlId;
                        }
                        else {
                            throw new Error(NI_SUPPORT.i18n('msg_PROPERTY_OUT_OF_RANGE', gPropertyName, cartesianAxisModelsLength - 1));
                        }
                        break;
                    }
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(CartesianPlotViewModel, NationalInstruments.HtmlVI.Elements.CartesianPlot, NationalInstruments.HtmlVI.Models.CartesianPlotModel, 'ni-cartesian-plot');
    NationalInstruments.HtmlVI.ViewModels.CartesianPlotViewModel = CartesianPlotViewModel;
})();
//# sourceMappingURL=niCartesianPlotViewModel.js.map