"use strict";
//****************************************
// Slider Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class SliderModel extends NationalInstruments.HtmlVI.Models.LinearNumericPointerModel {
        constructor(id) {
            super(id);
            this._showTooltip = true;
            this._mechanicalAction = 'switchWhileDragging';
        }
        static get MODEL_KIND() {
            return 'niSlider';
        }
        get showTooltip() {
            return this._showTooltip;
        }
        set showTooltip(value) {
            this._showTooltip = value;
            this.notifyModelPropertyChanged('showTooltip');
        }
        get mechanicalAction() {
            return this._mechanicalAction;
        }
        set mechanicalAction(value) {
            this._mechanicalAction = value;
            this.notifyModelPropertyChanged('mechanicalAction');
        }
    }
    NationalInstruments.HtmlVI.Models.SliderModel = SliderModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.SliderModel);
}());
//# sourceMappingURL=niSliderModel.js.map