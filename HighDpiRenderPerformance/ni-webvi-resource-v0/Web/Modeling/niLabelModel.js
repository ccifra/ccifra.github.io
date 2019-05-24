"use strict";
//****************************************
// Label Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class LabelModel extends NationalInstruments.HtmlVI.Models.VisualModel {
        constructor(id) {
            super(id);
            this._text = '';
            this._owningControlVisible = true;
        }
        static get TEXT_G_PROPERTY_NAME() {
            return "Text";
        }
        static get MODEL_KIND() {
            return 'niLabel';
        }
        get text() {
            return this._text;
        }
        set text(value) {
            this._text = value;
            this.notifyModelPropertyChanged('text');
        }
        get owningControlVisible() {
            return this._owningControlVisible;
        }
        set owningControlVisible(value) {
            this._owningControlVisible = value;
            this.notifyModelPropertyChanged('owningControlVisible');
        }
    }
    NationalInstruments.HtmlVI.Models.LabelModel = LabelModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.LabelModel);
}());
//# sourceMappingURL=niLabelModel.js.map