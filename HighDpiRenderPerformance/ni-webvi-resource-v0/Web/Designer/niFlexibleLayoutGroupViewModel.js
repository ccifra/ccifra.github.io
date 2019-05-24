"use strict";
//****************************************
// Flexible Layout Group View Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class FlexibleLayoutGroupViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        shouldElementUseModelHeight() {
            return false;
        }
        shouldElementUseModelWidth() {
            return false;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(FlexibleLayoutGroupViewModel, null, NationalInstruments.HtmlVI.Models.FlexibleLayoutGroupModel, 'ni-flexible-layout-group');
    NationalInstruments.HtmlVI.ViewModels.FlexibleLayoutGroupViewModel = FlexibleLayoutGroupViewModel;
})();
//# sourceMappingURL=niFlexibleLayoutGroupViewModel.js.map