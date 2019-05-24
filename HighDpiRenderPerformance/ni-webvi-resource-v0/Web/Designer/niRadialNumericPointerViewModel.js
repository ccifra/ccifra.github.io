"use strict";
//****************************************
// Visual View Model
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Functions
    const endAngleFromScaleArc = function (scaleArc) {
        return scaleArc.startAngle; // jqx goes opposite direction from ni
    };
    const startAngleFromScaleArc = function (scaleArc) {
        return scaleArc.startAngle + scaleArc.sweepAngle; // jqx goes opposite direction from ni
    };
    const scaleArcFromStartAndEndAngle = function (startAngle, endAngle) {
        const scaleArc = {
            startAngle: endAngle,
            sweepAngle: startAngle - endAngle
        };
        return scaleArc;
    };
    const convertToScalePosition = function (scaleVisible) {
        let scalePosition = '';
        if (scaleVisible === true) {
            scalePosition = 'inside';
        }
        else {
            scalePosition = 'none';
        }
        return scalePosition;
    };
    class RadialNumericPointerViewModel extends NationalInstruments.HtmlVI.ViewModels.NumericPointerViewModel {
        modelPropertyChanged(propertyName) {
            const renderBuffer = super.modelPropertyChanged(propertyName);
            switch (propertyName) {
                case 'scaleArc':
                    renderBuffer.properties.startAngle = startAngleFromScaleArc(this.model.scaleArc);
                    renderBuffer.properties.endAngle = endAngleFromScaleArc(this.model.scaleArc);
                    break;
                case 'scaleVisible':
                    renderBuffer.properties.scalePosition = convertToScalePosition(this.model.scaleVisible);
                    break;
            }
            return renderBuffer;
        }
        updateModelFromElement() {
            super.updateModelFromElement();
            const scaleArc = scaleArcFromStartAndEndAngle(this.element.startAngle, this.element.endAngle);
            this.model.scaleArc = scaleArc;
            this.model.scaleVisible = this.element.scalePosition === 'inside';
        }
        applyModelToElement() {
            super.applyModelToElement();
            this.element.startAngle = startAngleFromScaleArc(this.model.scaleArc);
            this.element.endAngle = endAngleFromScaleArc(this.model.scaleArc);
            this.element.scalePosition = convertToScalePosition(this.model.scaleVisible);
        }
    }
    NationalInstruments.HtmlVI.ViewModels.RadialNumericPointerViewModel = RadialNumericPointerViewModel;
})();
//# sourceMappingURL=niRadialNumericPointerViewModel.js.map