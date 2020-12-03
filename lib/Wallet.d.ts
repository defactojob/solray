/// <reference types="node" />
import * as bip32 from 'bip32';
import { Account, Connection, PublicKey } from '@solana/web3.js';
export declare class Wallet {
    base: bip32.BIP32Interface;
    conn: Connection;
    static generateMnemonic(bits?: number): string;
    static fromMnemonic(mnemonic: string, conn: Connection): Promise<Wallet>;
    static fromSeed(seed: Buffer, conn: Connection): Wallet;
    private sys;
    account: Account;
    constructor(base: bip32.BIP32Interface, conn: Connection);
    get address(): string;
    get pubkey(): PublicKey;
    derive(subpath: string): Wallet;
    deriveAccount(subpath: string): Account;
    info(subpath?: string): Promise<import("@solana/web3.js").AccountInfo<Buffer> | null>;
}
