"use strict";
//**********************************************************
// Static class to hold the various interaction states and kinds of interactions possible on the editor.
// National Instruments Copyright 2019
//**********************************************************
(function () {
    'use strict';
    const userInteractionState = Object.freeze({
        START: 'start',
        END: 'end',
        ATOMICACTIONCOMPLETE: 'atomicactioncomplete'
    });
    const interactiveOperationKind = Object.freeze({
        CREATE: 'create',
        MOVE: 'move',
        RESIZE: 'resize'
    });
    class EditorInteractionStates {
        static get UserInteractionState() {
            return userInteractionState;
        }
        static get InteractiveOperationKind() {
            return interactiveOperationKind;
        }
    }
    NationalInstruments.HtmlVI.EditorInteractionStates = EditorInteractionStates;
})();
//# sourceMappingURL=niEditorInteractionStates.js.map