"use strict";
//****************************************
// NIModel Base Class
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    class NIModel {
        constructor() {
            this._listeners = [];
        }
        notifyModelPropertyChanged(propertyName) {
            for (let i = 0; i < this._listeners.length; i++) {
                const listener = this._listeners[i];
                const renderBuffer = listener.modelPropertyChanged(propertyName);
                listener.applyElementChanges(renderBuffer);
            }
        }
        registerListener(listener) {
            this._listeners.push(listener);
        }
        unregisterListener(listener) {
            let i, index = -1;
            for (i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i] === listener) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                this._listeners.slice(index, 1);
            }
        }
        // A helper function used to set multiple properties on a model
        setMultipleProperties(settings) {
            let name;
            for (name in settings) {
                if (name in this) {
                    this[name] = settings[name];
                }
                else {
                    throw new Error('Unknown property assigned (' + name + ') for model kind (' + this.constructor.MODEL_KIND + ')');
                }
            }
        }
    }
    NationalInstruments.HtmlVI.Models.NIModel = NIModel;
}());
//# sourceMappingURL=niModel.js.map