"use strict";
//****************************************
// PlotRenderer View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class PlotRendererViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualComponentViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('lineWidth');
            this.registerAutoSyncProperty('lineStyle');
            this.registerAutoSyncProperty('pointShape');
            this.registerAutoSyncProperty('pointSize');
            this.registerAutoSyncProperty('pointColor');
            this.registerAutoSyncProperty('lineStroke');
            this.registerAutoSyncProperty('areaFill');
            this.registerAutoSyncProperty('barFill');
            this.registerAutoSyncProperty('barWidth');
            this.registerAutoSyncProperty('areaBaseLine');
            this.registerAutoSyncProperty('barBaseLine');
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(PlotRendererViewModel, NationalInstruments.HtmlVI.Elements.CartesianPlotRenderer, NationalInstruments.HtmlVI.Models.PlotRendererModel, 'ni-cartesian-plot-renderer');
    NationalInstruments.HtmlVI.ViewModels.PlotRendererViewModel = PlotRendererViewModel;
})();
//# sourceMappingURL=niPlotRendererViewModel.js.map