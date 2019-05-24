"use strict";
//***************************************
// Vireo Poker
// National Instruments Copyright 2018
//***************************************
// Summary:
// Serialize and write data to vireo.
// NationalInstruments.HtmlVI.VireoPoker.poke(vireo, viName, path, data)
// Writes data to vireo depending on the type of the variable represented by path
(function () {
    'use strict';
    const VIREO_STATIC_HELPERS = NationalInstruments.HtmlVI.VireoStaticHelpers;
    const getCellValue = function (data, dimensionLengths, cellIndex) {
        const ndimIndex = [];
        let i;
        for (i = dimensionLengths.length - 1; i >= 0; i--) {
            const index = cellIndex % dimensionLengths[i];
            cellIndex = Math.floor(cellIndex / dimensionLengths[i]);
            ndimIndex.unshift(index);
        }
        let currSubset = data;
        for (i = 0; i < ndimIndex.length; i++) {
            currSubset = currSubset[ndimIndex[i]];
        }
        return currSubset;
    };
    const getDataLengths = function (rank, data) {
        const lengths = [];
        let arr = data;
        let i;
        for (i = 0; i < rank; i++) {
            if (Array.isArray(arr)) {
                lengths.push(arr.length);
                arr = arr[0];
            }
            else {
                // some elements represent empty multidimensional arrays as the data []
                // and need to represent the lengths as ie. [0, 0, 0] for an empty 3d array
                lengths.push(0);
            }
        }
        return lengths;
    };
    class PokeVisitor {
        PokeVisitor() {
            this.vireo = undefined;
        }
        visitInt8(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitInt16(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitInt32(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitInt64(valueRef, data) {
            this.visitNumeric64(valueRef, data);
        }
        visitUInt8(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitUInt16(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitUInt32(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitUInt64(valueRef, data) {
            this.visitNumeric64(valueRef, data);
        }
        visitSingle(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitDouble(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitEnum8(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitEnum16(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitEnum32(valueRef, data) {
            this.visitNumeric(valueRef, data);
        }
        visitComplexSingle(valueRef, data) {
            this.visitComplex(valueRef, data);
        }
        visitComplexDouble(valueRef, data) {
            this.visitComplex(valueRef, data);
        }
        visitBoolean(valueRef, data) {
            this.vireo.eggShell.writeDouble(valueRef, data ? 1 : 0);
        }
        visitNumeric(valueRef, data) {
            // Looks like the data-grid ends up pushing the string value "-Infinity"
            // instead of the numeric value -Infinity to the model so perform parseFloat
            // in-case a string is passed instead of a number
            const dataNum = parseFloat(data);
            this.vireo.eggShell.writeDouble(valueRef, dataNum);
        }
        visitNumeric64(valueRef, data) {
            const jsonString = JSON.stringify(data);
            this.vireo.eggShell.writeJSON(valueRef, jsonString);
        }
        visitString(valueRef, data) {
            this.vireo.eggShell.writeString(valueRef, data);
        }
        visitPath(valueRef, data) {
            // TODO mraj workaround for writing empty paths to Vireo when using the writeJSON api
            if (data.components.length === 0) {
                data.components.push('');
            }
            const jsonString = JSON.stringify(data);
            this.vireo.eggShell.writeJSON(valueRef, jsonString);
        }
        visitComplex(valueRef, data) {
            const niComplex = new window.NIComplex(data);
            const realValueRef = this.vireo.eggShell.findSubValueRef(valueRef, 'real');
            const imaginaryValueRef = this.vireo.eggShell.findSubValueRef(valueRef, 'imaginary');
            this.vireo.eggShell.writeDouble(realValueRef, niComplex.realPart);
            this.vireo.eggShell.writeDouble(imaginaryValueRef, niComplex.imaginaryPart);
        }
        // -------------------------------------------------------------------------------------------
        // TODO: We need to add back the optimizations for 1D array case.
        // -------------------------------------------------------------------------------------------
        visitArray(valueRef, data) {
            const rank = this.vireo.eggShell.getArrayDimensions(valueRef).length;
            const dimensionLengths = getDataLengths(rank, data); // Computes lengths of a N-dimensional array
            const dimensionLengthsReversed = getDataLengths(rank, data).reverse();
            this.vireo.eggShell.resizeArray(valueRef, dimensionLengthsReversed); // Makes space if needed for new data
            const totalCells = VIREO_STATIC_HELPERS.totalCells(dimensionLengths);
            let i;
            for (i = 0; i < totalCells; i += 1) {
                // Builds a string with the following notation: "0,0" (First column of first row in a 2D array
                const subPath = VIREO_STATIC_HELPERS.buildArrayIndex(dimensionLengths, i);
                const subRef = this.vireo.eggShell.findSubValueRef(valueRef, subPath);
                const cellValue = getCellValue(data, dimensionLengths, i);
                // Delegate the writing to the subtype
                this.vireo.eggShell.reflectOnValueRef(this, subRef, cellValue);
            }
        }
        visitCluster(valueRef, data) {
            const that = this;
            const valueRefObject = that.vireo.eggShell.readValueRefObject(valueRef);
            Object.keys(valueRefObject).forEach(function (name) {
                that.vireo.eggShell.reflectOnValueRef(that, valueRefObject[name], data[name]);
            });
        }
        visitTimestamp(valueRef, data) {
            // TODO mraj reading a timestamp as a double may result in loss of precision, see https://nitalk.jiveon.com/thread/74202
            const timeStampValue = new window.NITimestamp(data).valueOf();
            this.vireo.eggShell.writeDouble(valueRef, timeStampValue);
        }
        visitAnalogWaveform(valueRef, data) {
            const valueRefObject = this.vireo.eggShell.readValueRefObject(valueRef);
            this.vireo.eggShell.reflectOnValueRef(this, valueRefObject['t0'], data['t0']);
            this.vireo.eggShell.reflectOnValueRef(this, valueRefObject['dt'], data['dt']);
            this.vireo.eggShell.reflectOnValueRef(this, valueRefObject['Y'], data['Y']);
        }
        visitJSObjectRefnum(valueRef, data) {
            this.vireo.eggShell.writeJavaScriptRefNum(valueRef, data);
        }
        static get singleton() {
            return _pokeVisitor;
        }
    }
    class VireoPoker {
        static pokeValueRef(vireo, valueRef, data) {
            PokeVisitor.singleton.vireo = vireo;
            return vireo.eggShell.reflectOnValueRef(PokeVisitor.singleton, valueRef, data);
        }
        static poke(vireo, viName, path, data) {
            const valueRef = vireo.eggShell.findValueRef(viName, path);
            return VireoPoker.pokeValueRef(vireo, valueRef, data);
        }
    }
    const _pokeVisitor = new PokeVisitor();
    NationalInstruments.HtmlVI.VireoPoker = VireoPoker;
}());
//# sourceMappingURL=niVireoPoker.js.map