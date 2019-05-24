"use strict";
//****************************************
// Front Panel Model
// National Instruments Copyright 2018
//****************************************
(function () {
    'use strict';
    class FrontPanelModel extends NationalInstruments.HtmlVI.Models.LayoutControlModel {
        constructor(id) {
            super(id);
            this._maxWidth = 'none';
            this._background = '';
        }
        static get BACKGROUND_COLOR_G_PROPERTY_NAME() {
            return 'BackgroundColor';
        }
        get maxWidth() {
            return this._maxWidth;
        }
        set maxWidth(value) {
            this._maxWidth = value;
            this.notifyModelPropertyChanged('maxWidth');
        }
        static get MODEL_KIND() {
            return 'niFrontPanel';
        }
        static get ONLINE_STATUS_CHANGED_EVENT_GUID() {
            return '{32EC6FD2-91DA-47A6-B0AC-F41B53FC3B37}';
        }
        static get ONLINE_STATUS_CHANGED_EVENT_INDEX() {
            return 17;
        }
        static get ONLINE_STATUS_CHANGED_EVENT_NAME() {
            return 'onlineStatus';
        }
        findTopLevelControl() {
            return this;
        }
        getLocalEventInfo(eventName) {
            if (eventName === NationalInstruments.HtmlVI.Models.FrontPanelModel.ONLINE_STATUS_CHANGED_EVENT_NAME) {
                return {
                    eventIndex: NationalInstruments.HtmlVI.Models.FrontPanelModel.ONLINE_STATUS_CHANGED_EVENT_INDEX,
                    eventDataId: NationalInstruments.HtmlVI.Models.FrontPanelModel.ONLINE_STATUS_CHANGED_EVENT_GUID
                };
            }
            return super.getLocalEventInfo(eventName);
        }
    }
    NationalInstruments.HtmlVI.Models.FrontPanelModel = FrontPanelModel;
    NationalInstruments.HtmlVI.NIModelProvider.registerModel(NationalInstruments.HtmlVI.Models.FrontPanelModel);
}());
//# sourceMappingURL=niFrontPanelModel.js.map