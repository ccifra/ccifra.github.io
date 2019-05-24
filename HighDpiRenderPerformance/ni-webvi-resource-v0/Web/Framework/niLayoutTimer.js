"use strict";
/**
 * Service sets a timer that will complete after the next animation frame
 * National Instruments Copyright 2018
 */
class NILayoutTimer {
    /**
     * @constructor
     * @param timerCallback - The function to execute after the timer completes
     */
    constructor(timerCallback) {
        this.rafRequestId = 0;
        this.timeoutRequestId = 0;
        if (typeof timerCallback !== "function") {
            throw new Error("Callback is not valid");
        }
        this.timerCallback = timerCallback;
    }
    /**
     * Start the timer. This will cancel any unfinished timers.
     */
    start() {
        if (this.rafRequestId !== 0) {
            cancelAnimationFrame(this.rafRequestId);
        }
        if (this.timeoutRequestId !== 0) {
            clearTimeout(this.timeoutRequestId);
            this.timeoutRequestId = 0;
        }
        // Using both requestAnimationFrame and setTimeout to ensure that the timer
        // completes AFTER layout has happened. RAF callback is called before layout.
        this.rafRequestId = requestAnimationFrame(() => this.rafCallback());
    }
    rafCallback() {
        this.rafRequestId = 0;
        this.timeoutRequestId = setTimeout(() => this.timeoutCallback(), 0);
    }
    timeoutCallback() {
        this.timeoutRequestId = 0;
        this.timerCallback();
    }
}
//# sourceMappingURL=niLayoutTimer.js.map