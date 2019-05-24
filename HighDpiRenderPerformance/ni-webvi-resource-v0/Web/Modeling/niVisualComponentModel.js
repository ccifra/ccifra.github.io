"use strict";
//****************************************
// Visual Component Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const IRootModel = NationalInstruments.HtmlVI.Models.IRootModel;
    class VisualComponentModel extends NationalInstruments.HtmlVI.Models.NIModel {
        //NIModel does not use the id so do not pass it
        constructor(niControlId) {
            super();
            this._niControlId = undefined;
            this.niControlId = niControlId;
            this.owner = undefined;
            this.rootOwner = undefined;
            this.childModels = [];
            this._viRef = undefined;
            this._followerIds = [];
            this._customClasses = [];
        }
        get customClasses() {
            return this._customClasses;
        }
        set customClasses(value) {
            this._customClasses = value;
            this.notifyModelPropertyChanged('customClasses');
        }
        get niControlId() {
            return this._niControlId;
        }
        set niControlId(id) {
            if ((this._niControlId === undefined || this._niControlId === id) && id !== undefined) {
                this._niControlId = id;
                this.notifyModelPropertyChanged('niControlId');
            }
            else {
                throw new Error('Cannot change niControlId after it has been assigned a valid value');
            }
        }
        get viRef() {
            return this._viRef;
        }
        set viRef(newVIRef) {
            if ((this._viRef === undefined || this._viRef === newVIRef) && newVIRef !== undefined) {
                this._viRef = newVIRef;
                this.notifyModelPropertyChanged('viRef');
            }
            else {
                throw new Error('Cannot change viRef after it has been assigned a valid value');
            }
        }
        get followerIds() {
            return this._followerIds;
        }
        set followerIds(value) {
            this._followerIds = value;
            //  We are not notifying for a follower-Ids property change intentionally. Follower-ids are supposed to remain unchanged.
        }
        getBindingInfo() {
            return undefined;
        }
        getRemoteBindingInfo() {
            return undefined;
        }
        getLocalBindingInfo() {
            return undefined;
        }
        getEditorRuntimeBindingInfo() {
            return undefined;
        }
        // Model Ownership Hierarchy Information
        setOwner(fp) {
            this.owner = fp;
            this.rootOwner = this.findRoot();
        }
        getOwner() {
            return this.owner;
        }
        addChildModel(child) {
            for (let i = 0; i < this.childModels.length; i++) {
                if (this.childModels[i].niControlId === child.niControlId) {
                    return false;
                }
            }
            this.childModels.push(child);
        }
        removeChildModel(child) {
            for (let i = 0; i < this.childModels.length; i++) {
                if (this.childModels[i].niControlId === child.niControlId) {
                    this.childModels.splice(i, 1);
                    break;
                }
            }
        }
        /**
         * Checks if the VisualComponentModel is bound to a data item. All controls except those in an array
         * or cluster should have a data item bound to them.
         * @returns True if a data item is bound to the VisualComponentModel; False otherwise.
         * @memberof VisualComponentModel
         */
        isDataItemBoundControl() {
            const bindingInfo = this.getBindingInfo();
            return bindingInfo !== undefined && bindingInfo.dataItem !== undefined && bindingInfo.dataItem !== '';
        }
        findTopLevelControl() {
            if (this.isDataItemBoundControl()) {
                return this;
            }
            const owner = this.getOwner();
            if (owner !== undefined) {
                return owner.findTopLevelControl();
            }
            return undefined;
        }
        getRoot() {
            if (this.rootOwner === undefined) {
                this.rootOwner = this.findRoot();
            }
            return this.rootOwner;
        }
        // SHOULD NOT USE DIRECTLY: Call getRoot instead for cached value
        findRoot() {
            let currOwner = this.getOwner();
            while (!IRootModel.isRootModel(currOwner)) {
                currOwner = currOwner.getOwner();
            }
            return currOwner;
        }
        internalControlEventOccurred(eventName, eventData) {
            const viModel = this.getRoot();
            viModel.internalControlEventOccurred(this, eventName, eventData);
        }
        requestSendControlBounds() {
            const viModel = this.getRoot();
            viModel.requestSendControlBounds();
        }
        isTopLevelAndPlacedAndEnabled() {
            return this.getLocalBindingInfo() !== undefined &&
                this.isDataItemBoundControl() &&
                this.getBindingInfo().unplacedOrDisabled === false;
        }
        enableEvents() {
            const viModel = this.getRoot();
            return viModel.enableEvents();
        }
        // This method is meant to be overriden by any JS control model that want control over whether to update its terminal value
        // for a specific G property read/write call.
        shouldUpdateTerminal(gPropertyName) {
            return false;
        }
    }
    NationalInstruments.HtmlVI.Models.VisualComponentModel = VisualComponentModel;
}());
//# sourceMappingURL=niVisualComponentModel.js.map