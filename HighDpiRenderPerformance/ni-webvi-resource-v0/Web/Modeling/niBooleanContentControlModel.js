"use strict";
//****************************************
// Boolean Control Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class BooleanContentControlModel extends NationalInstruments.HtmlVI.Models.BooleanControlModel {
        constructor(id) {
            super(id);
            this._trueContent = 'on';
            this._falseContent = 'off';
            this._falseContentVisibility = 'false';
        }
        get trueContent() {
            return this._trueContent;
        }
        set trueContent(value) {
            this._trueContent = value;
            this.notifyModelPropertyChanged('trueContent');
        }
        get falseContent() {
            return this._falseContent;
        }
        set falseContent(value) {
            this._falseContent = value;
            this.notifyModelPropertyChanged('falseContent');
        }
        get falseContentVisibility() {
            return this._falseContentVisibility;
        }
        set falseContentVisibility(value) {
            this._falseContentVisibility = value;
            this.notifyModelPropertyChanged('falseContentVisibility');
        }
    }
    NationalInstruments.HtmlVI.Models.BooleanContentControlModel = BooleanContentControlModel;
}());
//# sourceMappingURL=niBooleanContentControlModel.js.map