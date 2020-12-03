"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.u64LEBuffer = exports.u64FromBuffer = exports.uint64 = exports.publicKey = void 0;
const buffer_layout_1 = __importDefault(require("buffer-layout"));
/**
 * Layout for a public key
 */
const publicKey = (property) => {
    return buffer_layout_1.default.blob(32, property);
};
exports.publicKey = publicKey;
// /**
//  * Layout for a 64bit unsigned value
//  */
const uint64 = (property = 'uint64') => {
    return buffer_layout_1.default.blob(8, property);
};
exports.uint64 = uint64;
function u64FromBuffer(buf) {
    return buf.readBigUInt64LE();
}
exports.u64FromBuffer = u64FromBuffer;
function u64LEBuffer(n) {
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigUInt64LE(n);
    return buf;
}
exports.u64LEBuffer = u64LEBuffer;
