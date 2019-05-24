"use strict";
//****************************************
// Data Grid Column
// DOM Registration: No
// National Instruments Copyright 2014
//****************************************
// Static Public Variables
// None
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class DataGridColumn extends NationalInstruments.HtmlVI.Elements.Visual {
        // Static Private Variables
        // None
        // Static Private Functions
        // None
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = DataGridColumn.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'index',
                defaultValue: -1
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'header',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'fieldName',
                defaultValue: ''
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'width',
                defaultValue: '50px'
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'pinned',
                defaultValue: false
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'aggregates',
                defaultValue: '{}'
            });
        }
        createdCallback() {
            super.createdCallback();
            // Public Instance Properties
            // None
            // Private Instance Properties
            this._parentDataGrid = undefined;
        }
        sendEventToParentDataGrid(name, propertyName) {
            let eventConfig;
            if (this._parentDataGrid !== undefined) {
                eventConfig = {
                    cancelable: true,
                    detail: {
                        element: this,
                        propertyName: propertyName
                    }
                };
                this._parentDataGrid.dispatchEvent(new CustomEvent(name, eventConfig));
            }
        }
        attachedCallback() {
            const firstCall = super.attachedCallback();
            if (this.parentElement instanceof NationalInstruments.HtmlVI.Elements.DataGrid) {
                this._parentDataGrid = this.parentElement;
                this.sendEventToParentDataGrid('ni-data-grid-column-attached');
            }
            else {
                NI_SUPPORT.error('Data Grid Column does not have a parent data grid ' + this);
                this._parentDataGrid = undefined;
            }
            return firstCall;
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            this.sendEventToParentDataGrid('ni-data-grid-column-changed', propertyName);
        }
        detachedCallback() {
            super.detachedCallback();
            this.sendEventToParentDataGrid('ni-data-grid-column-detached');
            this._parentDataGrid = undefined;
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(DataGridColumn);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(DataGridColumn.prototype, 'ni-data-grid-column', 'HTMLNIDataGridColumn');
    NationalInstruments.HtmlVI.Elements.DataGridColumn = DataGridColumn;
}());
//# sourceMappingURL=ni-data-grid-column.js.map