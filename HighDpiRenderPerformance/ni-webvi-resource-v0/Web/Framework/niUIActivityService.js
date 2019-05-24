"use strict";
//****************************************
// NI LabVIEW UI Activity Service
// National Instruments Copyright 2014
//****************************************
//********************************************************
// Service that manages UI tracking behavior for browser elements
// The UI Activity Service provides the following behaviors:
// * DOM elements are registered as "activities" with managed callbacks (at least one of down or up)
// * The service attaches down callbacks for all registered activites and sets the current activity when a down event is detected
// * The service guarantees that activity callbacks are fired in the order down -> up if an up callback is provided
// * The service guarantees that a new activity is not started before the current activity is completed (before current activity up)
// Despite sounding heavy handed, the UI Activity Service is a thin wrapper around the native events (all the event args are passed straight through)
// Event table:
// If only up is registered then the evt parameter passed to the:
// * up callback may be undefined or a MouseEvent
// If only down is registered or up and down are both registered then the evt parameter passed to the:
// * down callback may a MouseEvent, or a TouchEvent
// * up callback may be undefined, a MouseEvent, or a TouchEvent
// undefined is passed to up callbacks when the action is completed due to an exceptional case: window looses focus, alternate control is activated, browser starts zoom / scroll gesture, etc.
//********************************************************
(function () {
    'use strict';
    let currentActivityId;
    let registeredActivities = {};
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    class UIActivityService {
        static get currentActivityId() {
            return currentActivityId;
        }
        static set currentActivityId(value) {
            currentActivityId = value;
        }
        static get registeredActivities() {
            return registeredActivities;
        }
        static set registeredActivities(value) {
            registeredActivities = value;
        }
        static createUIActivityObject(params) {
            let ignoreTouchListeners = false;
            if (typeof params !== 'object' || params === null) {
                throw new Error(NI_SUPPORT.i18n('msg_NO_PARAMETERS_SPECIFIED', 'NationalInstruments.HtmlVI.UIActivityService.register'));
            }
            if (typeof params.id !== 'string') {
                throw new Error(NI_SUPPORT.i18n('msg_PARAMETER_NOT_STRING', params.id));
            }
            if (params.element instanceof window.HTMLElement === false) {
                throw new Error(NI_SUPPORT.i18n('msg_PARAMETER_NOT_DOM_ELEMENT', params.element));
            }
            if (params.down !== undefined && typeof params.down !== 'function') {
                throw new Error('If a down parameter is provided it must be a function');
            }
            if (params.up !== undefined && typeof params.up !== 'function') {
                throw new Error('If an up parameter is provided it must be a function');
            }
            if (params.up === undefined && params.down === undefined) {
                throw new Error(NI_SUPPORT.i18n('msg_REQUIRES_AT_LEAST_ONE_PARAMETER', 'up, down', params));
            }
            // When just an up action is needed, either touch actions or mouse actions would have the same effect
            // The problem with touch actions is that you cannot determine the final element target without brittle hacks: http://stackoverflow.com/questions/12596121/get-the-element-under-a-touchend
            // So instead we opt for mouse events which give the correct target by ignoring touch listener registration in this case
            if (typeof params.up === 'function' && typeof params.down !== 'function') {
                ignoreTouchListeners = true;
            }
            return {
                id: params.id,
                element: params.element,
                ignoreTouchListeners: ignoreTouchListeners,
                down: params.down,
                downEventListener: undefined,
                up: params.up,
                upEventListener: undefined
            };
        }
        static addListenerToElement(eventName, element, eventListener, justKidding) {
            if (justKidding === true) {
                return;
            }
            element.addEventListener(eventName, eventListener, true);
        }
        static removeListenerFromElement(eventName, element, eventListener, justKidding) {
            if (justKidding === true) {
                return;
            }
            element.removeEventListener(eventName, eventListener, true);
        }
        static stopCurrentActivityListeners() {
            let currentActivity;
            if (UIActivityService.currentActivityId !== undefined) {
                currentActivity = UIActivityService.registeredActivities[UIActivityService.currentActivityId];
                UIActivityService.removeListenerFromElement('mouseup', window, currentActivity.upEventListener);
                UIActivityService.removeListenerFromElement('touchend', currentActivity.element, currentActivity.upEventListener, currentActivity.ignoreTouchListeners);
                UIActivityService.removeListenerFromElement('touchcancel', currentActivity.element, currentActivity.upEventListener, currentActivity.ignoreTouchListeners);
                currentActivity.upEventListener = currentActivity.moveEventListener = undefined;
                UIActivityService.currentActivityId = undefined;
            }
        }
        static verifyCurrentActivityActivated(activity) {
            if (activity.id !== UIActivityService.currentActivityId) {
                throw new Error(NI_SUPPORT.i18n('msg_UNEXPECTED_BEHAVIOR', 'Attempted to complete activity that was NOT the current activity. Only the current activity should be able to fire the up action.'));
            }
        }
        // The up action signifies the completion of the activity
        static upAction(activity, evt) {
            UIActivityService.verifyCurrentActivityActivated(activity);
            UIActivityService.stopCurrentActivityListeners();
            NI_SUPPORT.infoVerbose('Activity Service (UP) Action', evt);
            if (typeof activity.up === 'function') {
                activity.up.call(undefined, evt);
            }
        }
        static startCurrentActivityListeners(activity) {
            // If any non-atomic activity behaviour will occur then set-up the callbacks and current activity
            if (typeof activity.up === 'function') {
                UIActivityService.currentActivityId = activity.id;
                activity.upEventListener = UIActivityService.upAction.bind(undefined, activity);
                UIActivityService.addListenerToElement('mouseup', window, activity.upEventListener);
                UIActivityService.addListenerToElement('touchend', activity.element, activity.upEventListener, activity.ignoreTouchListeners);
                UIActivityService.addListenerToElement('touchcancel', activity.element, activity.upEventListener, activity.ignoreTouchListeners);
            }
        }
        // Called when a down occurs and need to register the activity behaviours
        static downAction(activity, evt) {
            let currentActivity;
            // Fired down on the same source twice so just continue the previous activity and trigger no action
            if (activity.id === UIActivityService.currentActivityId) {
                return;
            }
            // If a different activity is in progress, cancel it before making a new one
            if (UIActivityService.currentActivityId !== undefined) {
                currentActivity = UIActivityService.registeredActivities[UIActivityService.currentActivityId]; // Save a reference before the id is removed
                UIActivityService.stopCurrentActivityListeners();
                NI_SUPPORT.infoVerbose('Activity Service (UP) Action', 'no event args: new down started so ending previous');
                if (typeof currentActivity.up === 'function') {
                    currentActivity.up.call(undefined, undefined);
                }
            }
            UIActivityService.startCurrentActivityListeners(activity);
            // Prevent touch actions from triggering extra mouse events
            // typeof window.TouchEvent is 'function' in Chrome, 'object' in Safari and undefined in IE 11
            if (window.TouchEvent !== undefined && evt instanceof window.TouchEvent) {
                evt.preventDefault();
            }
            // Run the down callback
            NI_SUPPORT.infoVerbose('Activity Service (DOWN) Action', evt);
            if (typeof activity.down === 'function') {
                activity.down.call(undefined, evt);
            }
        }
        static isRegistered(id) {
            const activity = UIActivityService.registeredActivities[id];
            return (activity !== undefined);
        }
        static unregister(id) {
            const activity = UIActivityService.registeredActivities[id];
            if (activity === undefined) {
                throw new Error(NI_SUPPORT.i18n('msg_UNKNOWN_ID', id, 'Make sure to register an activity with the UIActivityService before attempting to remove the activity.'));
            }
            if (activity.id === UIActivityService.currentActivityId) {
                UIActivityService.stopCurrentActivityListeners();
                NI_SUPPORT.infoVerbose('Activity Service (UP) Action', 'no event args: unregister called while event action active so ending previous');
                if (typeof activity.up === 'function') {
                    activity.up.call(undefined, undefined);
                }
            }
            // Remove event listeners targeted to each element
            UIActivityService.removeListenerFromElement('mousedown', activity.element, activity.downEventListener);
            UIActivityService.removeListenerFromElement('touchstart', activity.element, activity.downEventListener, activity.ignoreTouchListeners);
            UIActivityService.registeredActivities[id] = undefined;
        }
        static register(params) {
            const activity = UIActivityService.createUIActivityObject(params);
            // If the activity id is currently registered, unregister the existing activity and continue
            // If the activity is currentActivity, running register again means we are cancelling the currentActivity
            if (UIActivityService.registeredActivities[activity.id] !== undefined) {
                UIActivityService.unregister(activity.id);
            }
            UIActivityService.registeredActivities[activity.id] = activity;
            // Add event listeners targeted to each element
            activity.downEventListener = UIActivityService.downAction.bind(undefined, activity);
            UIActivityService.addListenerToElement('mousedown', activity.element, activity.downEventListener);
            UIActivityService.addListenerToElement('touchstart', activity.element, activity.downEventListener, activity.ignoreTouchListeners);
        }
    }
    // Add event listeners targeted to the entire page
    // If an activity is running and a window blur occurs then cancel it (use blur to be more aggressive than HTML5 Page Visibility API)
    // Do not capture so only window node targeted events are responded to (blur does not bubble)
    window.addEventListener('blur', function () {
        let currentActivity;
        if (UIActivityService.currentActivityId !== undefined) {
            currentActivity = UIActivityService.registeredActivities[UIActivityService.currentActivityId]; // Save a reference before the id is removed
            UIActivityService.stopCurrentActivityListeners();
            NI_SUPPORT.infoVerbose('Activity Service (UP) Action', 'no event args: window lost focus so ending previous');
            if (typeof currentActivity.up === 'function') {
                currentActivity.up.call(undefined, undefined);
            }
        }
    }, false);
    NationalInstruments.HtmlVI.UIActivityService = UIActivityService;
}());
//# sourceMappingURL=niUIActivityService.js.map