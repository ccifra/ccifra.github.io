"use strict";
//****************************************
// Flexible Layout Component View Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class FlexibleLayoutComponentViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('layoutPattern');
        }
        shouldApplyDraggingStyleWithChild() {
            return true;
        }
        shouldElementUseModelHeight() {
            return false;
        }
        shouldElementUseModelWidth() {
            return false;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(FlexibleLayoutComponentViewModel, null, NationalInstruments.HtmlVI.Models.FlexibleLayoutComponentModel, 'ni-flexible-layout-component');
    NationalInstruments.HtmlVI.ViewModels.FlexibleLayoutComponentViewModel = FlexibleLayoutComponentViewModel;
})();
//# sourceMappingURL=niFlexibleLayoutComponentViewModel.js.map