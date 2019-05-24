//***************************************
// Vireo Peeker
// National Instruments Copyright 2018
//***************************************
// Summary:
// Extract and parse data from vireo.
// NationalInstruments.HtmlVI.VireoPeeker.peek(vireo, viName, path)
// Reads data from vireo depending on the type of the variable represented by path
'use strict';
const VIREO_STATIC_HELPERS = NationalInstruments.HtmlVI.VireoStaticHelpers;
class PeekVisitor {
    static groupByDimensionLength(arr, arrLength, dimensionLength) {
        let i, currArr, currArrIndex;
        if (arrLength % dimensionLength !== 0) {
            throw new Error('Cannot evenly split array into groups');
        }
        const retArr = [];
        currArr = [];
        currArrIndex = 0;
        // TODO mraj should benchmark and see if difference between slice and iteration
        for (i = 0; i < arrLength; i += 1) {
            currArr[currArrIndex] = arr[i];
            currArrIndex += 1;
            // After an increment currArrIndex is equivalent to the currArray length
            if (currArrIndex === dimensionLength) {
                retArr.push(currArr);
                currArr = [];
                currArrIndex = 0;
            }
        }
        return retArr;
    }
    static convertFlatArraytoNArray(arr, totalCells, dimensionLengths) {
        let i;
        const rank = dimensionLengths.length;
        // TODO mraj system expects a 1d empty array for an empty array of all ranks
        // ie for a rank 3 empty array the models want [] and not [[[]]]
        if (totalCells === 0) {
            return [];
        }
        // Perform a copy of array rank 1
        // TODO mraj only do the copy for typed arrays
        let currArr;
        if (rank === 1) {
            currArr = [];
            for (i = 0; i < totalCells; i += 1) {
                currArr[i] = arr[i];
            }
            return currArr;
        }
        // Perform nd array creation for rank > 1
        // TODO mraj this is O((m-1)n) for rank m. So rank 2 is O(n) and can be improved for rank > 2
        currArr = arr;
        let currArrLength = totalCells;
        let currDimensionLength;
        for (i = rank - 1; i >= 1; i -= 1) {
            currDimensionLength = dimensionLengths[i];
            currArr = PeekVisitor.groupByDimensionLength(currArr, currArrLength, currDimensionLength);
            currArrLength = currArr.length;
        }
        return currArr;
    }
    constructor() {
        this.vireo = undefined;
    }
    visitBoolean(valueRef) {
        return this.vireo.eggShell.readDouble(valueRef) !== 0;
    }
    visitNumeric(valueRef) {
        return this.vireo.eggShell.readDouble(valueRef);
    }
    visitNumeric64(valueRef) {
        return JSON.parse(this.vireo.eggShell.readJSON(valueRef));
    }
    visitInt8(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitInt16(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitInt32(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitInt64(valueRef) {
        return this.visitNumeric64(valueRef);
    }
    visitUInt8(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitUInt16(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitUInt32(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitUInt64(valueRef) {
        return this.visitNumeric64(valueRef);
    }
    visitSingle(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitDouble(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitEnum8(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitEnum16(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitEnum32(valueRef) {
        return this.visitNumeric(valueRef);
    }
    visitString(valueRef) {
        return this.vireo.eggShell.readString(valueRef);
    }
    visitPath(valueRef) {
        return JSON.parse(this.vireo.eggShell.readJSON(valueRef));
    }
    visitComplex(valueRef) {
        const realValueRef = this.vireo.eggShell.findSubValueRef(valueRef, 'real');
        const imaginaryValueRef = this.vireo.eggShell.findSubValueRef(valueRef, 'imaginary');
        const real = this.vireo.eggShell.readDouble(realValueRef);
        const imaginary = this.vireo.eggShell.readDouble(imaginaryValueRef);
        const niComplex = new window.NIComplex(real, imaginary);
        return niComplex.toString();
    }
    visitComplexSingle(valueRef) {
        return this.visitComplex(valueRef);
    }
    visitComplexDouble(valueRef) {
        return this.visitComplex(valueRef);
    }
    visitArray(valueRef) {
        let resultArray, indexedPath, subRef, cellValue;
        const dimensions = this.vireo.eggShell.getArrayDimensions(valueRef).reverse();
        const totalCells = VIREO_STATIC_HELPERS.totalCells(dimensions);
        let i;
        let isOptimizedArray = false;
        let testCellPath, testCellValueRef;
        if (totalCells > 0) {
            testCellPath = VIREO_STATIC_HELPERS.buildArrayIndex(dimensions, 0);
            testCellValueRef = this.vireo.eggShell.findSubValueRef(valueRef, testCellPath);
            isOptimizedArray = this.vireo.eggShell.reflectOnValueRef(VIREO_STATIC_HELPERS.isOptimizedArrayTypeVisitor, testCellValueRef);
        }
        if (isOptimizedArray) {
            resultArray = this.vireo.eggShell.readTypedArray(valueRef);
        }
        else {
            resultArray = [];
            for (i = 0; i < totalCells; i++) {
                // Builds a string with the following notation: "0,0" (First column of first row in a 2D array
                indexedPath = VIREO_STATIC_HELPERS.buildArrayIndex(dimensions, i);
                subRef = this.vireo.eggShell.findSubValueRef(valueRef, indexedPath);
                cellValue = this.vireo.eggShell.reflectOnValueRef(this, subRef);
                resultArray.push(cellValue);
            }
        }
        // Transform the 1-D array into a N-D array with specified dimensions.
        return PeekVisitor.convertFlatArraytoNArray(resultArray, totalCells, dimensions);
    }
    visitCluster(valueRef) {
        const that = this;
        const valueRefObject = that.vireo.eggShell.readValueRefObject(valueRef), value = {};
        Object.keys(valueRefObject).forEach(function (name) {
            value[name] = that.vireo.eggShell.reflectOnValueRef(that, valueRefObject[name]);
        });
        return value;
    }
    visitTimestamp(valueRef) {
        // TODO mraj reading a timestamp as a double may result in loss of precision, see https://nitalk.jiveon.com/thread/74202
        const value = this.vireo.eggShell.readDouble(valueRef);
        return new window.NITimestamp(value).toString();
    }
    visitAnalogWaveform(valueRef) {
        const valueRefObject = this.vireo.eggShell.readValueRefObject(valueRef);
        const timestampValue = this.vireo.eggShell.reflectOnValueRef(this, valueRefObject['t0']);
        const timeIntervalValue = this.vireo.eggShell.reflectOnValueRef(this, valueRefObject['dt']);
        const yValue = this.vireo.eggShell.reflectOnValueRef(this, valueRefObject['Y']);
        return { t0: timestampValue, dt: timeIntervalValue, Y: yValue };
    }
    visitJSObjectRefnum(valueRef) {
        return this.vireo.eggShell.readJavaScriptRefNum(valueRef);
    }
    static get peekVisitor() {
        return _peekVisitor;
    }
    static peekValueRef(vireo, valueRef) {
        PeekVisitor.peekVisitor.vireo = vireo;
        return vireo.eggShell.reflectOnValueRef(PeekVisitor.peekVisitor, valueRef);
    }
    static peek(vireo, viName, path) {
        const valueRef = vireo.eggShell.findValueRef(viName, path);
        return PeekVisitor.peekValueRef(vireo, valueRef);
    }
}
NationalInstruments.HtmlVI.VireoPeeker = Object.freeze({
    peek: PeekVisitor.peek,
    peekValueRef: PeekVisitor.peekValueRef
});
const _peekVisitor = new PeekVisitor();
//# sourceMappingURL=niVireoPeeker.js.map