"use strict";
//****************************************
// Cluster Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const NIType = window.NIType;
    class ClusterModel extends NationalInstruments.HtmlVI.Models.LayoutControlModel {
        constructor(id) {
            super(id);
            this.niType = new NIType({ name: 'Cluster', fields: [] });
            this._value = {};
        }
        static get MODEL_KIND() {
            return 'niCluster';
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
            this.notifyModelPropertyChanged('value');
        }
        addChildModel(child) {
            child.suppressControlChanged = true;
            super.addChildModel(child);
        }
        modelPropertyUsesNIType(propertyName) {
            return propertyName === 'value';
        }
        controlChanged(newValue, oldValue) {
            this.value = newValue;
            super.controlChanged('value', newValue, oldValue);
        }
    }
    NationalInstruments.HtmlVI.Models.ClusterModel = ClusterModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.ClusterModel);
}());
//# sourceMappingURL=niClusterModel.js.map