"use strict";
/**
 * Service that sends bounds update events to the LabVIEW editor
 * National Instruments Copyright 2018
 */
class NIBoundsUpdateEventService {
    /**
     * @constructor
     * @param frontPanelViewModel - View model for the HTML panel.
     * @param triggerEventCallback - Callback to send bounds event data.
     */
    constructor(frontPanelViewModel, triggerEventCallback) {
        this.boundsUpdateElements = new Map();
        this.layoutTimer = new NILayoutTimer(() => this.sendElementBoundsCore());
        if (typeof triggerEventCallback !== "function") {
            throw new Error("Callback is not valid");
        }
        this.frontPanelViewModel = frontPanelViewModel;
        this.triggerEventCallback = triggerEventCallback;
        this.boundsUpdateElements.set(frontPanelViewModel.model.niControlId, frontPanelViewModel.element);
    }
    /**
     * Registers a control element and sends a bounds update event
     * @param element - The HTML element to register
     * @param controlId - The ID of the associated control
     */
    onElementAdded(element, controlId) {
        this.validateElement(element);
        if (typeof controlId !== "string" && controlId !== "") {
            throw new Error("Control ID is not valid");
        }
        this.boundsUpdateElements.set(controlId, element);
        this.requestSendElementBounds();
    }
    /**
     * Unregisters a control element and sends a bounds update event
     * @param controlId - The ID of the control to unregister
     */
    onElementRemoved(controlId) {
        if (typeof controlId !== "string" && controlId !== "") {
            throw new Error("Control ID is not valid");
        }
        this.boundsUpdateElements.delete(controlId);
        this.requestSendElementBounds();
    }
    /**
     * Schedules a task to send control bounds to C#, unless one is already scheduled
     */
    requestSendElementBounds() {
        const that = this;
        if (!that.frontPanelViewModel.model.isFlexibleLayoutRoot()) {
            return;
        }
        this.layoutTimer.start();
    }
    sendElementBoundsCore() {
        const eventData = {};
        for (const [controlId, element] of this.boundsUpdateElements.entries()) {
            if (!document.body.contains(element) || element.parentElement == null) {
                // filter out elements that have been removed from the DOM, as a precaution
                this.boundsUpdateElements.delete(controlId);
                continue;
            }
            const elementRect = element.getBoundingClientRect();
            const parentRect = element.parentElement.getBoundingClientRect();
            if (elementRect.top === 0 &&
                elementRect.left === 0 &&
                elementRect.width === 0 &&
                elementRect.height === 0) {
                // don't send bounds updates with 0 values
                // most likely because element is display: none
                // e.g. hidden label
                continue;
            }
            const bounds = {
                bottom: elementRect.bottom - parentRect.top,
                height: elementRect.height,
                left: elementRect.left - parentRect.left,
                right: elementRect.right - parentRect.left,
                top: elementRect.top - parentRect.top,
                width: elementRect.width,
            };
            eventData[controlId] = bounds;
        }
        if (Object.keys(eventData).length !== 0) {
            this.triggerEventCallback(JSON.stringify(eventData));
        }
    }
    validateElement(element) {
        if (!(element instanceof Element)) {
            throw new Error("Element is not valid");
        }
    }
}
// @ts-ignore
NationalInstruments.HtmlVI.Framework.NIBoundsUpdateEventService = NIBoundsUpdateEventService;
//# sourceMappingURL=niBoundsUpdateEventService.js.map