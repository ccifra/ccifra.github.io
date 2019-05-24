'use strict';
//****************************************
// NI Control DCO Index Cache
// National Instruments Copyright 2014
//****************************************
class ControlDCOIndexCache {
    constructor(viModels) {
        this._dcoIndexToControlMap = undefined;
        this.viModels = viModels;
    }
    static createDCOIndexMaps(viModels) {
        const dcoIndexMap = {};
        let viModelName;
        for (viModelName in viModels) {
            if (viModels.hasOwnProperty(viModelName)) {
                const viModel = viModels[viModelName];
                const controlModels = viModel.getAllControlModels();
                if (dcoIndexMap[viModelName] === undefined) {
                    dcoIndexMap[viModelName] = {};
                }
                let controlId;
                for (controlId in controlModels) {
                    if (controlModels.hasOwnProperty(controlId)) {
                        const controlModel = controlModels[controlId], remoteBindingInfo = controlModel.getRemoteBindingInfo();
                        if (remoteBindingInfo !== undefined) {
                            dcoIndexMap[viModelName][remoteBindingInfo.dco] = remoteBindingInfo;
                        }
                    }
                }
            }
        }
        return dcoIndexMap;
    }
    getRemoteBindingInfo(viModelName, dcoIndex) {
        if (this._dcoIndexToControlMap === undefined || this._dcoIndexToControlMap[viModelName] === undefined) {
            this._dcoIndexToControlMap = ControlDCOIndexCache.createDCOIndexMaps(this.viModels);
        }
        return this._dcoIndexToControlMap[viModelName][dcoIndex];
    }
}
NationalInstruments.HtmlVI.ControlDCOIndexCache = ControlDCOIndexCache;
//# sourceMappingURL=niControlDCOIndexCache.js.map