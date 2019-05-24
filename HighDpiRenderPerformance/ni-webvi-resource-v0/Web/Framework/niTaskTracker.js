'use strict';
//****************************************
// Task Tracker
// National Instruments Copyright 2014
//****************************************
class TaskTracker {
    constructor(taskNames, completionCallback) {
        const createTaskList = function (taskNames, completionCallback) {
            const keys = Object.keys(taskNames);
            let i;
            if (typeof completionCallback !== 'function') {
                throw new Error('Completion callback function must be provided');
            }
            if (keys.length < 1) {
                throw new Error('Must provide an object with at least one property to use as task names');
            }
            for (i = 0; i < keys.length; i = i + 1) {
                if (taskNames[keys[i]] !== keys[i]) {
                    throw new Error('Task name properties and values must be identical; the task names object must be an enum style object');
                }
            }
            return keys;
        };
        // Properties
        this.remainingTasks = createTaskList(taskNames, completionCallback);
        this.taskNames = taskNames;
        this.completionCallback = completionCallback;
    }
    complete(task) {
        let i;
        if (this.taskNames[task] === undefined) {
            throw new Error('Attempted to complete the following invalid task: ' + task);
        }
        if (this.remainingTasks.length === 0) {
            return;
        }
        for (i = 0; i < this.remainingTasks.length; i = i + 1) {
            if (this.remainingTasks[i] === task) {
                this.remainingTasks.splice(i, 1);
                break;
            }
        }
        if (this.remainingTasks.length === 0) {
            this.completionCallback.call(undefined);
        }
    }
}
NationalInstruments.HtmlVI.TaskTracker = TaskTracker;
//# sourceMappingURL=niTaskTracker.js.map