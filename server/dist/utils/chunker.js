"use strict";
// utils/chunker.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkArray = void 0;
// Break an array into chunks of a given size
const chunkArray = (arr, size) => {
    return arr.reduce((acc, _, i) => {
        if (i % size === 0)
            acc.push(arr.slice(i, i + size));
        return acc;
    }, []);
};
exports.chunkArray = chunkArray;
