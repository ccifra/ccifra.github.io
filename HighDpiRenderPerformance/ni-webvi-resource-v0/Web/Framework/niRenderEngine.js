"use strict";
//*****************************************************
// Rendering Engine
// National Instruments Copyright 2014
//*****************************************************
(function () {
    'use strict';
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const RENDER_BUFFER = NationalInstruments.HtmlVI.RenderBuffer;
    let updateQueue = []; // List of elements to update.
    const updateMap = {}; // {niElementId: niRenderBuffer}
    const updatePending = {}; // {niElementId: true}
    let frameRequested = false;
    let frameUpdated = Promise.resolve();
    class RenderEngine {
        // static private
        static addCSSClasses(element, classListToAdd) {
            let i;
            for (i = 0; i < classListToAdd.length; i++) {
                if (typeof classListToAdd[i] !== 'string') {
                    throw new Error(NI_SUPPORT.i18n('msg_RENDERBUFFER_EXPECTS_STRING', 'css classes to add', typeof classListToAdd[i]));
                }
                else {
                    element.classList.add(classListToAdd[i]);
                }
            }
        }
        // static private
        static removeCSSClasses(element, classListToRemove) {
            let i;
            for (i = 0; i < classListToRemove.length; i++) {
                if (typeof classListToRemove[i] !== 'string') {
                    throw new Error(NI_SUPPORT.i18n('msg_RENDERBUFFER_EXPECTS_STRING', 'css classes to remove', typeof classListToRemove[i]));
                }
                else {
                    element.classList.remove(classListToRemove[i]);
                }
            }
        }
        // static private
        static setInlineStyle(element, cssStyles) {
            let newStyle;
            for (newStyle in cssStyles) {
                if (cssStyles.hasOwnProperty(newStyle)) {
                    if (typeof cssStyles[newStyle] !== 'string') {
                        throw new Error(NI_SUPPORT.i18n('msg_RENDERBUFFER_EXPECTS_STRING', 'element style', typeof cssStyles[newStyle]));
                    }
                    else if (cssStyles[newStyle] === RENDER_BUFFER.REMOVE_CUSTOM_PROPERTY_TOKEN) {
                        element.style.removeProperty(newStyle);
                    }
                    else {
                        element.style.setProperty(newStyle, cssStyles[newStyle]);
                    }
                }
            }
        }
        // static private
        static setAttributes(element, attributesToSet) {
            let newAttr;
            for (newAttr in attributesToSet) {
                if (attributesToSet.hasOwnProperty(newAttr)) {
                    if (typeof attributesToSet[newAttr] !== 'string') {
                        throw new Error(NI_SUPPORT.i18n('msg_RENDERBUFFER_EXPECTS_STRING', 'element attributes', typeof attributesToSet[newAttr]));
                    }
                    else {
                        element.setAttribute(newAttr, attributesToSet[newAttr]);
                    }
                }
            }
        }
        // static private
        static setProperties(element, propertiesToSet) {
            let newProp;
            for (newProp in propertiesToSet) {
                if (propertiesToSet.hasOwnProperty(newProp)) {
                    if (propertiesToSet[newProp] === undefined) {
                        throw new Error('Property cannot be undefined ' + newProp);
                    }
                    else {
                        element[newProp] = propertiesToSet[newProp];
                    }
                }
            }
        }
        // static private
        static dispatchResizeEventWhenSizeChanges(element, cssStyles) {
            if (Object.keys(cssStyles).length > 0) {
                const actSize = { width: cssStyles.width, height: cssStyles.height };
                if (actSize.width !== undefined || actSize.height !== undefined) {
                    element.dispatchEvent(new CustomEvent('resizeEventHack', { detail: actSize }));
                }
            }
        }
        // static private
        static applyDomUpdates(element, renderBuffer) {
            RenderEngine.addCSSClasses(element, renderBuffer.cssClasses.toAdd);
            RenderEngine.removeCSSClasses(element, renderBuffer.cssClasses.toRemove);
            RenderEngine.setInlineStyle(element, renderBuffer.cssStyles);
            RenderEngine.setAttributes(element, renderBuffer.attributes);
            RenderEngine.setProperties(element, renderBuffer.properties);
            RenderEngine.dispatchResizeEventWhenSizeChanges(element, renderBuffer.cssStyles);
        }
        // static private
        static callPostRenderFunctions(postRender) {
            if (typeof postRender !== 'object') {
                throw new Error('postRender should be assigned functions via named properties');
            }
            for (const funcName in postRender) {
                if (postRender.hasOwnProperty(funcName)) {
                    if (typeof postRender[funcName] !== 'function') {
                        throw new Error('postRender[' + funcName + '] is not a function');
                    }
                    else {
                        postRender[funcName]();
                    }
                }
            }
        }
        // static private
        static runFrameUpdate() {
            let element, renderBuffer, niElementId;
            try {
                // We try to do all the work at once.
                while (updateQueue.length > 0) {
                    element = updateQueue.shift();
                    niElementId = element.niElementInstanceId;
                    renderBuffer = updateMap[niElementId];
                    updatePending[niElementId] = false;
                    RenderEngine.applyDomUpdates(element, renderBuffer);
                    RenderEngine.callPostRenderFunctions(renderBuffer.postRender);
                    renderBuffer.reset();
                }
            }
            finally {
                frameRequested = false;
            }
        }
        static getOrAddRenderBuffer(element) {
            if (!NI_SUPPORT.isElement(element)) {
                throw new Error('Element should be an instance of Html Custom Element.');
            }
            const niElementId = element.niElementInstanceId;
            let renderBuffer = updateMap[niElementId];
            if (renderBuffer === undefined) {
                renderBuffer = new NationalInstruments.HtmlVI.RenderBuffer();
                updateMap[niElementId] = renderBuffer;
            }
            return renderBuffer;
        }
        static removeRenderBuffer(element) {
            if (!NI_SUPPORT.isElement(element)) {
                throw new Error('Element should be an instance of Html Custom Element.');
            }
            const niElementId = element.niElementInstanceId, renderBuffer = updateMap[niElementId];
            if (renderBuffer !== undefined) {
                updateMap[niElementId] = undefined;
                updatePending[niElementId] = undefined;
                updateQueue = updateQueue.filter(function (e) {
                    return e.niElementInstanceId !== niElementId;
                });
            }
            return renderBuffer;
        }
        static enqueueDomUpdate(element) {
            if (!NI_SUPPORT.isElement(element)) {
                throw new Error('Element should be an instance of HtmlElement.');
            }
            const niElementId = element.niElementInstanceId;
            const renderBuffer = updateMap[niElementId];
            if (renderBuffer === undefined) {
                throw Error('Did you forget to getOrAddRenderBuffer?');
            }
            if (renderBuffer.isEmpty() === false &&
                (updatePending[niElementId] === false || updatePending[niElementId] === undefined)) {
                updatePending[niElementId] = true;
                updateQueue.push(element);
            }
            if (NI_SUPPORT.SYNCHRONIZE_RENDER_BUFFER === true && updateQueue.length > 0) {
                frameRequested = true;
                RenderEngine.runFrameUpdate();
                return;
            }
            if (frameRequested === false && updateQueue.length > 0) {
                frameRequested = true;
                frameUpdated = new Promise((resolve) => {
                    window.requestAnimationFrame(() => {
                        RenderEngine.runFrameUpdate();
                        resolve();
                    });
                });
            }
        }
        static isFrameRequested() {
            return frameRequested;
        }
        static waitForFrameUpdate() {
            return frameUpdated;
        }
    }
    NationalInstruments.HtmlVI.RenderEngine = RenderEngine;
})();
//# sourceMappingURL=niRenderEngine.js.map