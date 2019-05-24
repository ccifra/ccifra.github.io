"use strict";
//****************************************
// Tank View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class TankViewModel extends NationalInstruments.HtmlVI.ViewModels.LinearNumericPointerViewModel {
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(TankViewModel, null, NationalInstruments.HtmlVI.Models.TankModel, 'jqx-tank');
    NationalInstruments.HtmlVI.ViewModels.TankViewModel = TankViewModel;
})();
//# sourceMappingURL=niTankViewModel.js.map