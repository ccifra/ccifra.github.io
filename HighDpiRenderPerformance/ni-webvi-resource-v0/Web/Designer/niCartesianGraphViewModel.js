"use strict";
//****************************************
// CartesianGraph View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class CartesianGraphViewModel extends NationalInstruments.HtmlVI.ViewModels.GraphBaseViewModel {
        // Public Prototype Methods
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            const that = this;
            switch (propertyName) {
                case 'value':
                    renderBuffer.postRender.value = function () {
                        that.element.setData(that.model.value);
                    };
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.value = this.element.value;
            this.model.defaultValue = this.element.value;
            this.model.plotAreaMargin = this.element.plotAreaMargin;
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.value = this.model.value;
            this.element.plotAreaMargin = this.model.plotAreaMargin;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(CartesianGraphViewModel, NationalInstruments.HtmlVI.Elements.CartesianGraph, NationalInstruments.HtmlVI.Models.CartesianGraphModel, 'ni-cartesian-graph');
    NationalInstruments.HtmlVI.ViewModels.CartesianGraphViewModel = CartesianGraphViewModel;
})();
//# sourceMappingURL=niCartesianGraphViewModel.js.map