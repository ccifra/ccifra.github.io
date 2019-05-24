"use strict";
//****************************************
// ScaleLegend View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class ScaleLegendViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('graphRef');
            this.registerAutoSyncProperty('isInEditMode');
        }
        isFollower() {
            return true;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(ScaleLegendViewModel, NationalInstruments.HtmlVI.Elements.ScaleLegend, NationalInstruments.HtmlVI.Models.ScaleLegendModel, 'ni-scale-legend');
    NationalInstruments.HtmlVI.ViewModels.ScaleLegendViewModel = ScaleLegendViewModel;
})();
//# sourceMappingURL=niScaleLegendViewModel.js.map