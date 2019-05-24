"use strict";
//****************************************
// Tab Control Prototype
// DOM Registration: HTMLNITabControl
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    // Static Private Reference Aliases
    const NI_SUPPORT = NationalInstruments.HtmlVI.NISupport;
    const $ = NationalInstruments.Globals.jQuery;
    // Static Private Functions
    const getHeaderContainers = function (target) {
        let i;
        const headerContainers = [];
        // IE11 does not support scoped direct child querySelector so just iterate manually
        for (i = 0; i < target.children.length; i++) {
            if (target.children[i].classList.contains('jqx-ribbon')) {
                headerContainers.push(target.children[i]);
            }
        }
        // TODO mraj found that in some cases using send to back from the editor on a deeply nested tab creates
        // conditions resulting in multiple header containers being made, but not sure of the root cause
        if (headerContainers.length > 1) {
            NI_SUPPORT.infoVerbose('TabControl should always either have zero or one headerContainers but currently has (' + headerContainers.length + ')');
        }
        return headerContainers;
    };
    const applySelectedIndex = function (target) {
        let jqref, i, selectedTabItem;
        const currentHeaderContainers = getHeaderContainers(target);
        const hasValidTabs = target._validTabHeadersLength > 0;
        const selectedIndexInValidTabsRange = target.selectedIndex >= 0 && target.selectedIndex < target._validTabHeadersLength;
        const hasValidHeaderContainer = currentHeaderContainers.length === 1;
        if (hasValidTabs && selectedIndexInValidTabsRange && hasValidHeaderContainer) {
            jqref = $(currentHeaderContainers[0]);
            if (target.selectedIndex !== jqref.jqxRibbon('selectedIndex')) {
                jqref.jqxRibbon({
                    selectedIndex: target.selectedIndex
                });
            }
            for (i = 0; i < target.children.length; i++) {
                if (target.children[i] instanceof NationalInstruments.HtmlVI.Elements.TabItem) {
                    if (target.children[i].tabPosition === target.selectedIndex) {
                        target.children[i].classList.add('ni-selected');
                        selectedTabItem = target.children[i];
                    }
                    else {
                        target.children[i].classList.remove('ni-selected');
                    }
                }
            }
            if (selectedTabItem === undefined) {
                NI_SUPPORT.infoVerbose('Expected a tab item selectedIndex (' + target.selectedIndex + ') to exist, but none was found.');
            }
            else {
                selectedTabItem.forceResizeChildren(true);
            }
        }
        else {
            NI_SUPPORT.infoVerbose('TabControl was provided invalid selectedIndex (' + target.selectedIndex + ') when the number of valid tab items is (' + target._validTabHeadersLength + ')');
        }
    };
    const createHeaderContainer = function (target) {
        // Generated DOM:
        //<div class="jqx-ribbon">
        //    <ul class="jqx-ribbon-header">
        //        <li class="jqx-ribbon-item">Tab Header 1</li>
        //        ...
        //    </ul>
        //    <div class="jqx-ribbon-content">
        //        <div class="jqx-ribbon-content-section"><!-- Empty Tab 1 --></div>
        //        ...
        //    </div>
        //</div>
        const container = document.createElement('div');
        let tabHeaders, tabFrames;
        let i, currHeader, validTabHeadersLength;
        let headers = [];
        for (i = 0; i < target.children.length; i++) {
            if (target.children[i] instanceof NationalInstruments.HtmlVI.Elements.TabItem) {
                if (headers[target.children[i].tabPosition] === undefined) {
                    headers[target.children[i].tabPosition] = target.children[i].header;
                }
                else {
                    // If error, reset header and stop iteration
                    NI_SUPPORT.infoVerbose('TabControl has multiple TabItems with tabPosition (' + target.children[i].tabPosition + ')');
                    headers = [];
                    break;
                }
            }
        }
        tabHeaders = document.createElement('ul');
        tabFrames = document.createElement('div');
        if (headers.length > 0) {
            for (i = 0; i < headers.length; i++) {
                if (typeof headers[i] === 'string') {
                    currHeader = document.createElement('li');
                    currHeader.textContent = headers[i];
                    tabHeaders.appendChild(currHeader);
                    tabFrames.appendChild(document.createElement('div'));
                }
                else {
                    // If error, reset headers + frames and stop iteration
                    NI_SUPPORT.infoVerbose('TabControl is missing TabItem at tabPosition (' + i + ')');
                    tabHeaders = document.createElement('ul');
                    tabFrames = document.createElement('div');
                    break;
                }
            }
        }
        // jqx fails to render without at least one tab
        if (tabHeaders.children.length === 0) {
            currHeader = document.createElement('li');
            currHeader.innerHTML = '&nbsp;';
            tabHeaders.appendChild(currHeader);
            tabFrames.appendChild(document.createElement('div'));
            NI_SUPPORT.infoVerbose('TabControl has no valid TabItems to render, creating dummy so jqxRibbon does not error');
            validTabHeadersLength = 0;
        }
        else {
            validTabHeadersLength = tabHeaders.children.length;
        }
        // tabHeaders and tabFrames should be the same length
        if (tabHeaders.children.length !== tabFrames.children.length) {
            throw new Error('The generated number of tab headers and tab frames should be the same');
        }
        container.appendChild(tabHeaders);
        container.appendChild(tabFrames);
        return {
            container: container,
            validTabHeadersLength: validTabHeadersLength
        };
    };
    const attachHeaderContainer = function (target) {
        const widgetSettings = {};
        const existingHeadersToRemove = getHeaderContainers(target);
        let i;
        for (i = 0; i < existingHeadersToRemove.length; i = i + 1) {
            target.removeChild(existingHeadersToRemove[i]);
        }
        const createHeaderContainerResult = createHeaderContainer(target);
        const childElement = createHeaderContainerResult.container;
        target._validTabHeadersLength = createHeaderContainerResult.validTabHeadersLength;
        // If firstElementChild is null then insertBefore will append correctly
        target.insertBefore(childElement, target.firstElementChild);
        widgetSettings.animationType = 'none';
        widgetSettings.position = target.tabStripPlacement.toLowerCase();
        widgetSettings.disabled = target.disabled;
        // Override 'legacy' theme because this control was rethemed by NI in niControlStyles CSS
        widgetSettings.theme = 'ni-rethemed';
        const jqref = $(childElement);
        jqref.jqxRibbon(widgetSettings);
        jqref.on('select', function (evt) {
            target.selectedIndex = evt.args.selectedIndex;
        });
        applySelectedIndex(target);
    };
    const queueAttachHeaderContainer = function (target) {
        if (target._attachHeaderContainerQueued === false) {
            target._attachHeaderContainerQueued = true;
            window.requestAnimationFrame(function () {
                target._attachHeaderContainerQueued = false;
                attachHeaderContainer(target);
            });
        }
    };
    const isTabItemHidden = function (tabItem) {
        return (tabItem.classList.contains('ni-hidden'));
    };
    const switchToNextSelectableTabItemOnRight = function (target, currentSelectedTabIndex) {
        // First child of Tab control is jqx ribbon so we have to ignore that.
        for (let i = currentSelectedTabIndex + 2; i < target.childElementCount; i++) {
            if (checkAndUpdateSelectedIndexToGivenIndex(target, i)) {
                return true;
            }
        }
        return false;
    };
    const switchToNextSelectableTabItemOnLeft = function (target, currentSelectedTabIndex) {
        for (let i = currentSelectedTabIndex; i > 0; i--) {
            if (checkAndUpdateSelectedIndexToGivenIndex(target, i)) {
                return true;
            }
        }
        return false;
    };
    const checkAndUpdateSelectedIndexToGivenIndex = function (target, index) {
        // First child of Tab control is jqx ribbon so we have to ignore that.
        if (target.children[index].disabled === false && !isTabItemHidden(target.children[index])) {
            target.selectedIndex = index - 1;
            return true;
        }
        return false;
    };
    const updateSelectedTabIndex = function (target, tabItemIndex) {
        const currentSelectedTabIndex = target.selectedIndex;
        if (currentSelectedTabIndex === tabItemIndex) {
            const success = switchToNextSelectableTabItemOnRight(target, currentSelectedTabIndex);
            if (!success) {
                switchToNextSelectableTabItemOnLeft(target, currentSelectedTabIndex);
            }
        }
    };
    const updateRibbonDisableState = function (tabItem, target) {
        const currentHeaderContainers = getHeaderContainers(target);
        const ribbon = $(currentHeaderContainers[0]);
        if (tabItem.disabled) {
            ribbon.jqxRibbon('disableAt', tabItem.tabPosition);
        }
        else {
            ribbon.jqxRibbon('enableAt', tabItem.tabPosition);
        }
    };
    const updateRibbonVisibleState = function (tabItem, target) {
        const currentHeaderContainers = getHeaderContainers(target);
        const ribbon = $(currentHeaderContainers[0]);
        if (!isTabItemHidden(tabItem)) {
            ribbon.jqxRibbon('showAt', tabItem.tabPosition);
        }
        else {
            ribbon.jqxRibbon('hideAt', tabItem.tabPosition);
        }
    };
    // Static Private Variables
    // None
    class TabControl extends NationalInstruments.HtmlVI.Elements.LayoutControl {
        // Public Prototype Methods
        addAllProperties(targetPrototype) {
            super.addAllProperties(targetPrototype);
            const proto = TabControl.prototype;
            proto.addProperty(targetPrototype, {
                propertyName: 'selectedIndex',
                defaultValue: 0,
                fireEvent: true,
                addNonSignalingProperty: true
            });
            proto.addProperty(targetPrototype, {
                propertyName: 'tabStripPlacement',
                defaultValue: 'top'
            });
            NI_SUPPORT.setValuePropertyDescriptor(targetPrototype, 'selectedIndex', 'selectedIndex', 'selectedIndexNonSignaling', 'selected-index-changed');
        }
        createdCallback() {
            super.createdCallback();
            // Public Instance Properties
            // None
            // Private Instance Properties
            this._validTabHeadersLength = 0;
            this._attachHeaderContainerQueued = false;
        }
        attachedCallback() {
            const firstCall = super.attachedCallback(), that = this;
            if (firstCall === true) {
                that.addEventListener('ni-tab-item-attached', function (evt) {
                    if (evt.target === that) {
                        queueAttachHeaderContainer(that);
                    }
                });
                that.addEventListener('ni-tab-item-detached', function (evt) {
                    if (evt.target === that) {
                        queueAttachHeaderContainer(that);
                    }
                });
                that.addEventListener('ni-tab-item-header-updated', function (evt) {
                    if (evt.target === that) {
                        queueAttachHeaderContainer(that);
                    }
                });
                that.addEventListener('ni-tab-item-position-updated', function (evt) {
                    if (evt.target === that) {
                        queueAttachHeaderContainer(that);
                    }
                });
                that.addEventListener('ni-tab-item-visibility-updated', function (evt) {
                    if (evt.target === that) {
                        const tabItem = evt.detail.element;
                        if (isTabItemHidden(tabItem)) {
                            updateSelectedTabIndex(that, tabItem.tabPosition);
                        }
                        updateRibbonVisibleState(tabItem, that);
                    }
                });
                that.addEventListener('ni-tab-item-disabled-updated', function (evt) {
                    if (evt.target === that) {
                        const tabItem = evt.detail.element;
                        if (tabItem.disabled) {
                            updateSelectedTabIndex(that, tabItem.tabPosition);
                        }
                        updateRibbonDisableState(tabItem, that);
                    }
                });
                queueAttachHeaderContainer(that);
                this.updateDisableStateForChildren();
            }
            return firstCall;
        }
        propertyUpdated(propertyName) {
            super.propertyUpdated(propertyName);
            switch (propertyName) {
                case 'selectedIndex':
                    applySelectedIndex(this);
                    break;
                case 'tabStripPlacement':
                    // Changing the position of the jqxRibbon header causes render problems in jqx, so instead recreate the whole header.
                    queueAttachHeaderContainer(this);
                    break;
                case 'disabled':
                    this.updateDisableStateForRibbon();
                    this.updateDisableStateForChildren();
                    break;
                default:
                    break;
            }
        }
        updateDisableStateForRibbon() {
            const currentHeaderContainers = getHeaderContainers(this);
            const ribbon = $(currentHeaderContainers[0]);
            ribbon.jqxRibbon({ disabled: this.disabled });
        }
        updateDisableStateForChildren() {
            for (let i = 0; i < this.children.length; i++) {
                const tabItem = this.children[i];
                if (tabItem instanceof NationalInstruments.HtmlVI.Elements.TabItem) {
                    const disableStateForChild = (this.disabled) ? true : tabItem.disabled;
                    tabItem.updateDisableStateForChild(disableStateForChild);
                }
            }
        }
        setFont(fontSize, fontFamily, fontWeight, fontStyle, textDecoration) {
            super.setFont(fontSize, fontFamily, fontWeight, fontStyle, textDecoration);
            // Completely re-create the header just so jqx can figure out the scoll buttons in the header
            queueAttachHeaderContainer(this);
        }
        forceResize(size) {
            super.forceResize(size);
            // Completely re-create the header just so jqx can figure out the scoll buttons in the header
            queueAttachHeaderContainer(this);
        }
    }
    NationalInstruments.HtmlVI.ElementRegistrationService.registerElement(TabControl);
    NationalInstruments.HtmlVI.Elements.VisualComponent.defineElementInfo(TabControl.prototype, 'ni-tab-control', 'HTMLNITabControl');
    NationalInstruments.HtmlVI.Elements.TabControl = TabControl;
}());
//# sourceMappingURL=ni-tab-control.js.map