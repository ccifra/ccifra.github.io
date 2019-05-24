"use strict";
//****************************************
// ColorScale View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class ColorScaleViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('axisPosition');
            this.registerAutoSyncProperty('autoScale');
            this.registerAutoSyncProperty('label');
            this.registerAutoSyncProperty('show');
            this.registerAutoSyncProperty('showLabel');
            this.registerAutoSyncProperty('highColor');
            this.registerAutoSyncProperty('lowColor');
            this.registerAutoSyncProperty('markers');
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(ColorScaleViewModel, NationalInstruments.HtmlVI.Elements.ColorScale, NationalInstruments.HtmlVI.Models.ColorScaleModel, 'ni-color-scale');
    NationalInstruments.HtmlVI.ViewModels.ColorScaleViewModel = ColorScaleViewModel;
})();
//# sourceMappingURL=niColorScaleViewModel.js.map