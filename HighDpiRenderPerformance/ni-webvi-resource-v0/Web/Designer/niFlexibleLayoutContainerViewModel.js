"use strict";
//****************************************
// Flexible Layout Container View Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class FlexibleLayoutContainerViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('direction');
            this.registerAutoSyncProperty('horizontalContentAlignment');
            this.registerAutoSyncProperty('verticalContentAlignment');
        }
        modelPropertyChanged(propertyName) {
            super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'direction':
                case 'horizontalContentAlignment':
                case 'verticalContentAlignment':
                    this.model.requestSendControlBounds();
                    break;
            }
        }
        shouldElementUseModelHeight() {
            return false;
        }
        shouldElementUseModelWidth() {
            return false;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(FlexibleLayoutContainerViewModel, null, NationalInstruments.HtmlVI.Models.FlexibleLayoutContainerModel, 'ni-flexible-layout-container');
    NationalInstruments.HtmlVI.ViewModels.FlexibleLayoutContainerViewModel = FlexibleLayoutContainerViewModel;
})();
//# sourceMappingURL=niFlexibleLayoutContainerViewModel.js.map