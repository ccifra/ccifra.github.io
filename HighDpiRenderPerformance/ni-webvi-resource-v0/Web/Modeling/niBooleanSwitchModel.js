"use strict";
//****************************************
// Boolean Switch Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    const _orientationEnum = Object.freeze({
        VERTICAL: 'vertical',
        HORIZONTAL: 'horizontal'
    });
    class BooleanSwitchModel extends NationalInstruments.HtmlVI.Models.BooleanContentControlModel {
        constructor(id) {
            super(id);
            this._orientation = BooleanSwitchModel.OrientationEnum.HORIZONTAL;
            this._textAlignment = 'left';
        }
        static get MODEL_KIND() {
            return 'niBooleanSwitch';
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
        get textAlignment() {
            return this._textAlignment;
        }
        set textAlignment(value) {
            this._textAlignment = value;
            this.notifyModelPropertyChanged('textAlignment');
        }
    }
    NationalInstruments.HtmlVI.Models.BooleanSwitchModel = BooleanSwitchModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.BooleanSwitchModel);
}());
//# sourceMappingURL=niBooleanSwitchModel.js.map