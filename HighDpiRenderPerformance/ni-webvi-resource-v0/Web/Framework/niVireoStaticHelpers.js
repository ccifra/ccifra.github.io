"use strict";
//***************************************
// Vireo Static Helpers
// National Instruments Copyright 2014
//***************************************
(function () {
    'use strict';
    const supported = function () {
        return true;
    };
    const unsupported = function () {
        return false;
    };
    class OptimizedArrayTypeVisitor {
        constructor() {
            this.visitBoolean = unsupported;
            this.visitInt8 = supported;
            this.visitInt16 = supported;
            this.visitInt32 = supported;
            this.visitInt64 = unsupported;
            this.visitUInt8 = supported;
            this.visitUInt16 = supported;
            this.visitUInt32 = supported;
            this.visitUInt64 = unsupported;
            this.visitSingle = supported;
            this.visitDouble = supported;
            this.visitEnum8 = supported;
            this.visitEnum16 = supported;
            this.visitEnum32 = supported;
            this.visitString = unsupported;
            this.visitPath = unsupported;
            this.visitComplexSingle = unsupported;
            this.visitComplexDouble = unsupported;
            this.visitArray = unsupported;
            this.visitCluster = unsupported;
            this.visitTimestamp = unsupported;
            this.visitAnalogWaveform = unsupported;
        }
    }
    const _isOptimizedArrayTypeVisitor = new OptimizedArrayTypeVisitor();
    class VireoStaticHelpers {
        static whenVireoLoaded(callback, wasmUrl) {
            if (typeof callback !== 'function') {
                throw new Error('Registering a vireoLoaded callback requires a valid function to invoke');
            }
            window.vireoHelpers.createInstance({ wasmUrl }).then(function (vireo) {
                callback(vireo);
            });
        }
        // Builds an indexed path to be used for reading a N-dimensional array in vireo's memory
        // @param path: variable name in vireo.
        // @param sizes: the length of each dimension of the array. e.g. [2, 3] <- A 2 by 3 2D-Array.
        // @param cellIndex: considering a flatten N-dimensional array, the cell index to find.
        //  e.g. path = 'myArray', sizes = [3, 4], cellIndex = 7
        //  this means that myArray is a 3 by 4 array which could be flatten to a 12 cells array.
        //  asking the 7th cell would return 'myArray.1.3' <- 2nd row, 4th column.
        static buildArrayIndex(sizes, cellIndex) {
            const ndimIndex = [];
            let i;
            for (i = sizes.length - 1; i >= 0; i--) {
                const index = cellIndex % sizes[i];
                cellIndex = Math.floor(cellIndex / sizes[i]);
                ndimIndex.unshift(index);
            }
            return ndimIndex.join(',');
        }
        static totalCells(dimensionLengths) {
            let totalCells = dimensionLengths.length === 0 ? 0 : 1;
            let i;
            for (i = 0; i < dimensionLengths.length; i++) {
                totalCells *= dimensionLengths[i];
            }
            return totalCells;
        }
        static get isOptimizedArrayTypeVisitor() {
            return _isOptimizedArrayTypeVisitor;
        }
    }
    NationalInstruments.HtmlVI.VireoStaticHelpers = VireoStaticHelpers;
}());
//# sourceMappingURL=niVireoStaticHelpers.js.map