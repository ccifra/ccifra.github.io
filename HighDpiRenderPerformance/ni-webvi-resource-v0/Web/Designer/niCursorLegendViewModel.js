"use strict";
//****************************************
// CursorLegend View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class CursorLegendViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('graphRef');
            this.registerAutoSyncProperty('isInEditMode');
        }
        isFollower() {
            return true;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(CursorLegendViewModel, NationalInstruments.HtmlVI.Elements.CursorLegend, NationalInstruments.HtmlVI.Models.CursorLegendModel, 'ni-cursor-legend');
    NationalInstruments.HtmlVI.ViewModels.CursorLegendViewModel = CursorLegendViewModel;
})();
//# sourceMappingURL=niCursorLegendViewModel.js.map