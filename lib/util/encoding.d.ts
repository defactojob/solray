/// <reference types="node" />
/**
 * Layout for a public key
 */
export declare const publicKey: (property: string) => Object;
export declare const uint64: (property?: string) => Object;
export declare function u64FromBuffer(buf: Buffer): bigint;
export declare function u64LEBuffer(n: bigint): Buffer;
