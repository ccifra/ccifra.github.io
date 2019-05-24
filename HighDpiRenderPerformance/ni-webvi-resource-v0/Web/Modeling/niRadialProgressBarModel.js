"use strict";
//****************************************
// Radial Progress Bar Model
// National Instruments Copyright 2014
//****************************************
// NOTE:
// The C# Model exposes an IsSegmented property here which is non-configurable.
// In addition, jqxWidgets does not support something like that property at the present time.
// We may also want to expose the animationDuration property in here an in the associated C# ViewModel
(function () {
    'use strict';
    class RadialProgressBarModel extends NationalInstruments.HtmlVI.Models.ProgressBarModel {
        static get MODEL_KIND() {
            return 'niRadialProgressBar';
        }
    }
    NationalInstruments.HtmlVI.Models.RadialProgressBarModel = RadialProgressBarModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.RadialProgressBarModel);
}());
//# sourceMappingURL=niRadialProgressBarModel.js.map