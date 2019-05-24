"use strict";
//****************************************
// Graph Tools View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    class GraphToolsViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('graphRef');
            this.registerAutoSyncProperty('isInEditMode');
            this.registerAutoSyncProperty('mode');
        }
        isFollower() {
            return true;
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(GraphToolsViewModel, NationalInstruments.HtmlVI.Elements.GraphTools, NationalInstruments.HtmlVI.Models.GraphToolsModel, 'ni-graph-tools');
    NationalInstruments.HtmlVI.ViewModels.GraphToolsViewModel = GraphToolsViewModel;
})();
//# sourceMappingURL=niGraphToolsViewModel.js.map