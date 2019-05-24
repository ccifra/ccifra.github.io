"use strict";
/**
 * Service that handles the registration and un-registration of control events
 * National Instruments Copyright 2018
 */
class NIEventRegistrationService {
    constructor() {
        // {viName : {controlId: eventOracleIndex}}
        this.eventOracleMaps = new Map();
        // {viName: {eventOracleIndex: [eventID]}}
        this.registeredEventMaps = new Map();
    }
    /**
     * Used as a callback from Vireo to register for a control event. This is used to keep track
     * of controls and registered events so that we can selectively call occurEvent only on controls
     *  that have events registered to them.
     * @param viName - Name of the VI on which the control is found
     * @param controlId - The ID of the control for which we're registering an event
     * @param eventId - The ID of the event being registered
     * @param eventOracleIndex - The EventOracleIndex for the registered event
     */
    registerForControlEvents(viName, controlId, eventId, eventOracleIndex) {
        if (!this.eventOracleMaps.has(viName)) {
            this.eventOracleMaps.set(viName, new Map());
        }
        const controlIdToEventOracleIndex = this.eventOracleMaps.get(viName);
        controlIdToEventOracleIndex.set(controlId, eventOracleIndex);
        if (!this.registeredEventMaps.has(viName)) {
            this.registeredEventMaps.set(viName, new Map());
        }
        const eventOracleIndexToEventIds = this.registeredEventMaps.get(viName);
        if (!eventOracleIndexToEventIds.has(eventOracleIndex)) {
            eventOracleIndexToEventIds.set(eventOracleIndex, []);
        }
        const registeredEventsForControl = eventOracleIndexToEventIds.get(eventOracleIndex);
        if (!registeredEventsForControl.includes(eventId)) {
            registeredEventsForControl.push(eventId);
        }
        else {
            throw new Error("An event was registered multiple times for the same control.");
        }
    }
    /**
     * Used as a callback from Vireo to unregister for a control event. This will remove the event
     * id from the list of registered events for a control and remove the event oracle index for
     * the control, if there are no longer any events registered for it.
     * @param viName - Name of the VI on which the control is found
     * @param controlId - The ID of the control for which we're unregistering an event
     * @param eventId - The ID of the event being unregistered
     * @param eventOracleIndex - The EventOracleIndex for event being unregistered
     */
    unRegisterForControlEvents(viName, controlId, eventId, eventOracleIndex) {
        if (this.registeredEventMaps.has(viName)) {
            const eventOracleIndexToEventIds = this.registeredEventMaps.get(viName);
            if (eventOracleIndexToEventIds.has(eventOracleIndex)) {
                const registeredEventsForControl = eventOracleIndexToEventIds.get(eventOracleIndex);
                const eventIdIndex = registeredEventsForControl.indexOf(eventId);
                if (eventIdIndex > -1) {
                    registeredEventsForControl.splice(eventIdIndex, 1);
                }
                else {
                    throw new Error("An attempt was made to un-register an event that wasn't currently registered.");
                }
                // If there are no more event IDs, delete corresponding entries from both maps.
                if (registeredEventsForControl.length === 0) {
                    const controlIdToEventOracleIndex = this.eventOracleMaps.get(viName);
                    controlIdToEventOracleIndex.delete(controlId);
                    eventOracleIndexToEventIds.delete(eventOracleIndex);
                }
            }
        }
    }
    /**
     * Gets the event oracle index for the given control. This index is unique per control
     * @param controlModel - Model of the control for which we're looking for an event oracle index
     */
    getEventOracleIndex(controlModel) {
        const viName = controlModel.getRoot().getNameVireoEncoded();
        if (this.eventOracleMaps.has(viName)) {
            const controlIdToEventOracleIndex = this.eventOracleMaps.get(viName);
            const intControlId = parseInt(controlModel.niControlId, 10);
            if (controlIdToEventOracleIndex.has(intControlId)) {
                return controlIdToEventOracleIndex.get(intControlId);
            }
        }
        return -1;
    }
    /**
     * Checks whether a given event is registered on the given event oracle index
     * @param viName - Name of the VI within which we're checking events
     * @param eventOracleIndex - Event oracle index of the control on which we're checking events
     * @param eventId - The ID of the event against which we're checking
     */
    isControlRegisteredForEvent(viName, eventOracleIndex, eventId) {
        if (this.registeredEventMaps.has(viName)) {
            const eventOracleIndexToEventIds = this.registeredEventMaps.get(viName);
            if (eventOracleIndexToEventIds.has(eventOracleIndex)) {
                const registeredEventsForControl = eventOracleIndexToEventIds.get(eventOracleIndex);
                return registeredEventsForControl.indexOf(eventId) > -1;
            }
        }
        return false;
    }
}
/**
 * Must stay in sync with CommonEventIndex.cs.
 */
var CommonEventIds;
(function (CommonEventIds) {
    CommonEventIds[CommonEventIds["ValueChanged"] = 2] = "ValueChanged";
})(CommonEventIds || (CommonEventIds = {}));
// @ts-ignore
NationalInstruments.HtmlVI.NIEventRegistrationService = NIEventRegistrationService;
NationalInstruments.HtmlVI.CommonEventIds = CommonEventIds;
//# sourceMappingURL=niEventRegistrationService.js.map