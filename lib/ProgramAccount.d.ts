/// <reference types="node" />
import { PublicKey } from '@solana/web3.js';
export declare class ProgramAccount {
    pubkey: PublicKey;
    noncedSeed: Buffer;
    programID: PublicKey;
    static forSeed(seed: Buffer, programID: PublicKey): Promise<ProgramAccount>;
    constructor(pubkey: PublicKey, noncedSeed: Buffer, programID: PublicKey);
    get address(): string;
    get nonce(): number;
}
