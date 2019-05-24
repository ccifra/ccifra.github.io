"use strict";
//****************************************
// Cursor View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    const VisualModel = NationalInstruments.HtmlVI.Models.VisualModel;
    const CursorModel = NationalInstruments.HtmlVI.Models.CursorModel;
    // Other graph parts inherit from VisualComponentViewModel but cursor wants to support font so it inherits from VisualViewModel
    class CursorViewModel extends NationalInstruments.HtmlVI.ViewModels.VisualViewModel {
        constructor(element, model) {
            super(element, model);
            this.registerAutoSyncProperty('label');
            this.registerAutoSyncProperty('targetShape');
            this.registerAutoSyncProperty('show');
            this.registerAutoSyncProperty('color');
            this.registerAutoSyncProperty('crosshairStyle');
            this.registerAutoSyncProperty('showLabel');
            this.registerAutoSyncProperty('showValue');
            this.registerAutoSyncProperty('snapToPlot');
            this.registerAutoSyncProperty('xaxis');
            this.registerAutoSyncProperty('yaxis');
            this.registerAutoSyncProperty('x');
            this.registerAutoSyncProperty('y');
        }
        bindToView() {
            super.bindToView();
            const that = this;
            NationalInstruments.Globals.jQuery(this.element).on('cursorUpdated', function () {
                const newValue = { x: that.element.x, y: that.element.y };
                that.model.controlChanged(newValue);
            });
        }
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'color':
                    this.element.setColor(this.model.color);
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const style = window.getComputedStyle(this.element);
            this.model.color = style.getPropertyValue('color');
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.style.color = this.model.color;
        }
        getGPropertyValue(gPropertyName) {
            switch (gPropertyName) {
                case CursorModel.NAME_G_PROPERTY_NAME:
                    return this.model.label;
                case VisualModel.VISIBLE_G_PROPERTY_NAME:
                    return this.model.show;
                case CursorModel.X_POSITION_G_PROPERTY_NAME:
                    return this.element.xPosition;
                case CursorModel.Y_POSITION_G_PROPERTY_NAME:
                    return this.element.yPosition;
                default:
                    return super.getGPropertyValue(gPropertyName);
            }
        }
        setGPropertyValue(gPropertyName, gPropertyValue) {
            switch (gPropertyName) {
                case CursorModel.NAME_G_PROPERTY_NAME:
                    this.model.label = gPropertyValue;
                    break;
                case VisualModel.VISIBLE_G_PROPERTY_NAME:
                    this.model.show = gPropertyValue;
                    break;
                case CursorModel.X_POSITION_G_PROPERTY_NAME:
                    this.element.xPosition = gPropertyValue;
                    break;
                case CursorModel.Y_POSITION_G_PROPERTY_NAME:
                    this.element.yPosition = gPropertyValue;
                    break;
                default:
                    super.setGPropertyValue(gPropertyName, gPropertyValue);
            }
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider.registerViewModel(CursorViewModel, NationalInstruments.HtmlVI.Elements.Cursor, NationalInstruments.HtmlVI.Models.CursorModel, 'ni-cursor');
    NationalInstruments.HtmlVI.ViewModels.CursorViewModel = CursorViewModel;
})();
//# sourceMappingURL=niCursorViewModel.js.map