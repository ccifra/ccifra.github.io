"use strict";
//****************************************
// Linear Progress Bar Model
// National Instruments Copyright 2014
//****************************************
// NOTE:
// The C# Model exposes an IsSegmented property here which is non-configurable.
// In addition, jqxWidgets does not support something like that property at the present time.
// We may also want to expose the animationDuration property in here an in the associated C# ViewModel
(function () {
    'use strict';
    const _orientationEnum = Object.freeze({
        VERTICAL: 'vertical',
        HORIZONTAL: 'horizontal'
    });
    class LinearProgressBarModel extends NationalInstruments.HtmlVI.Models.ProgressBarModel {
        constructor(id) {
            super(id);
            this._orientation = LinearProgressBarModel.OrientationEnum.HORIZONTAL;
        }
        static get MODEL_KIND() {
            return 'niLinearProgressBar';
        }
        static get OrientationEnum() {
            return _orientationEnum;
        }
        get orientation() {
            return this._orientation;
        }
        set orientation(value) {
            this._orientation = value;
            this.notifyModelPropertyChanged('orientation');
        }
    }
    NationalInstruments.HtmlVI.Models.LinearProgressBarModel = LinearProgressBarModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.LinearProgressBarModel);
}());
//# sourceMappingURL=niLinearProgressBarModel.js.map