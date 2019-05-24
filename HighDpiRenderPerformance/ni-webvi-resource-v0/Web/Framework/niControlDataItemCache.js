'use strict';
//****************************************
// NI Control Data Item Cache
// National Instruments Copyright 2014
//****************************************
class ControlDataItemCache {
    constructor(viModels) {
        this._dataItemToControlMap = undefined;
        this.viModels = viModels;
    }
    static createDataItemMaps(viModels) {
        const dataItemMap = {};
        let viModelName;
        for (viModelName in viModels) {
            if (viModels.hasOwnProperty(viModelName)) {
                const viModel = viModels[viModelName];
                const controlModels = viModel.getAllControlModels();
                if (dataItemMap[viModelName] === undefined) {
                    dataItemMap[viModelName] = {};
                }
                let controlId;
                for (controlId in controlModels) {
                    if (controlModels.hasOwnProperty(controlId)) {
                        const controlModel = controlModels[controlId];
                        const editorRuntimeBindingInfo = controlModel.getEditorRuntimeBindingInfo();
                        const isVisualModel = editorRuntimeBindingInfo !== undefined;
                        const isBoundControl = isVisualModel && editorRuntimeBindingInfo.dataItem !== undefined;
                        const isTopLevelControl = isBoundControl && editorRuntimeBindingInfo.dataItem !== '';
                        if (isTopLevelControl) {
                            dataItemMap[viModelName][editorRuntimeBindingInfo.dataItem] = editorRuntimeBindingInfo;
                        }
                    }
                }
            }
        }
        return dataItemMap;
    }
    getEditorRuntimeBindingInfo(viModelName, dataItem) {
        if (this._dataItemToControlMap === undefined || this._dataItemToControlMap[viModelName] === undefined) {
            this._dataItemToControlMap = ControlDataItemCache.createDataItemMaps(this.viModels);
        }
        const info = this._dataItemToControlMap[viModelName][dataItem];
        if (info === undefined) {
            throw new Error('Missing editorRuntimeBindingInfo - are you sure the model was created?. viModelName: ' + viModelName + ' | dataItem:  ' + dataItem + ' | registered dataItems: ' + Object.keys(this._dataItemToControlMap[viModelName]).join(', '));
        }
        return info;
    }
}
NationalInstruments.HtmlVI.ControlDataItemCache = ControlDataItemCache;
//# sourceMappingURL=niControlDataItemCache.js.map