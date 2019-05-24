"use strict";
//****************************************
// Custom Element Extensions
// National Instruments Copyright 2014
//****************************************
(function () {
    'use strict';
    let tagMap = [];
    let modelKindMap = [];
    let modelFactory = [];
    let viewModelFactory = [];
    class ModelProvider {
        static get TagMap() {
            return tagMap;
        }
        static set TagMap(value) {
            tagMap = value;
        }
        static get ModelKindMap() {
            return modelKindMap;
        }
        static set ModelKindMap(value) {
            modelKindMap = value;
        }
        static get ModelFactory() {
            return modelFactory;
        }
        static set ModelFactory(value) {
            modelFactory = value;
        }
        static get ViewModelFactory() {
            return viewModelFactory;
        }
        static set ViewModelFactory(value) {
            viewModelFactory = value;
        }
        registerModel(modelType) {
            ModelProvider.ModelFactory[modelType.MODEL_KIND] = modelType;
        }
        makeModel(kind, id) {
            const factory = ModelProvider.ModelFactory[kind];
            if (factory !== undefined) {
                // eslint-disable-next-line new-cap
                return new factory(id);
            }
            throw new Error('Cannot find model constructor with kind: ' + kind);
        }
        registerViewModel(viewModelType, elementConstructor, modelType, elementTagName) {
            let tagName;
            if (elementTagName !== undefined) {
                tagName = elementTagName;
            }
            else {
                tagName = elementConstructor.prototype.elementInfo.tagName;
            }
            ModelProvider.TagMap[tagName] = modelType.MODEL_KIND;
            ModelProvider.ModelKindMap[modelType.MODEL_KIND] = tagName;
            ModelProvider.ViewModelFactory[modelType.MODEL_KIND] = viewModelType;
        }
        makeViewModel(element, model) {
            const kind = ModelProvider.TagMap[element.elementInfo.tagName];
            if (kind === undefined) {
                throw new Error('Cannot find model kind associated with tag: ' + element.elementInfo.tagName);
            }
            if (typeof ModelProvider.ViewModelFactory[kind] !== 'function') {
                throw new Error('Cannot find viewmodel constructor function for model kind: ' + kind);
            }
            return new ModelProvider.ViewModelFactory[kind](element, model);
        }
        tagNameToModelKind(elementTag) {
            if (typeof ModelProvider.TagMap[elementTag] !== 'string') {
                throw new Error('Cannot find model kind for tag: ' + elementTag);
            }
            return ModelProvider.TagMap[elementTag];
        }
        modelKindToTagName(modelKind) {
            if (typeof ModelProvider.ModelKindMap[modelKind] !== 'string') {
                throw new Error('Cannot find tag for model kind: ' + modelKind);
            }
            return ModelProvider.ModelKindMap[modelKind];
        }
    }
    NationalInstruments.HtmlVI.NIModelProvider = ModelProvider;
    // Create Global Singleton
    NationalInstruments.HtmlVI.NIModelProvider = new ModelProvider();
}());
//# sourceMappingURL=niModelProvider.js.map