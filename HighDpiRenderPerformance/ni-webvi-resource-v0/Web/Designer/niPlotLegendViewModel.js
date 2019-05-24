"use strict";
//****************************************
// PlotLegend View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class PlotLegendViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('graphRef');
            this.registerAutoSyncProperty('isInEditMode');
        }
        userInteractionChanged(newState, operationKind) {
            if (newState === 'start') {
                // Brace yourself. The user is coming
                this.element.throttlePlotUpdates(true);
            }
            if (newState === 'end') {
                // End of the user interaction
                this.element.throttlePlotUpdates(false);
            }
            if (newState === 'atomicactioncomplete') {
                // the plots and renderers are in a consistent state, take the opportunity and display them.
                this.element.syncPlotLegendWithGraph();
            }
            super.userInteractionChanged(newState, operationKind);
        }
        isFollower() {
            return true;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(PlotLegendViewModel, NationalInstruments.HtmlVI.Elements.PlotLegend, NationalInstruments.HtmlVI.Models.PlotLegendModel, 'ni-plot-legend');
    NationalInstruments.HtmlVI.ViewModels.PlotLegendViewModel = PlotLegendViewModel;
})();
//# sourceMappingURL=niPlotLegendViewModel.js.map