"use strict";
//****************************************
// Path Selector Control View Model
// National Instruments Copyright 2015
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const CSS_PROPERTIES = NationalInstruments.HtmlVI.CssProperties;
    class PathSelectorViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('format');
            this.registerAutoSyncProperty('popupEnabled');
        }
        bindToView() {
            super.bindToView();
            const that = this;
            that.enableResizeHack();
            that.bindFocusEventListener();
            that.element.addEventListener('path-changed', function (evt) {
                const pathValue = evt.detail.path;
                const newValue = JSON.parse(pathValue);
                that.model.controlChanged(newValue);
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            let modelPath;
            switch (propertyName) {
                case 'path':
                    modelPath = this.model.path;
                    renderBuffer.properties.pathNonSignaling = JSON.stringify(modelPath);
                    break;
                case 'textAlignment':
                    renderBuffer.cssStyles[CSS_PROPERTIES.TEXT_ALIGN] = this.model.textAlignment;
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            this.model.path = JSON.parse(this.element.path);
            this.model.defaultValue = JSON.parse(this.element.path);
            this.model.popupEnabled = this.element.popupEnabled;
            const style = window.getComputedStyle(this.element);
            this.model.textAlignment = style.getPropertyValue(CSS_PROPERTIES.TEXT_ALIGN);
        }
        applyModelToElement() {
            super.applyModelToElement();
            const modelPath = this.model.path;
            this.element.pathNonSignaling = JSON.stringify(modelPath);
            this.element.popupEnabled = this.model.popupEnabled;
            this.element.style.setProperty(CSS_PROPERTIES.TEXT_ALIGN, this.model.textAlignment);
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(PathSelectorViewModel, NationalInstruments.HtmlVI.Elements.PathSelector, NationalInstruments.HtmlVI.Models.PathSelectorModel);
    NationalInstruments.HtmlVI.ViewModels.PathSelectorViewModel = PathSelectorViewModel;
})();
//# sourceMappingURL=niPathSelectorViewModel.js.map