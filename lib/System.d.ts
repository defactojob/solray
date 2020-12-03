/// <reference types="node" />
import { Wallet } from './Wallet';
import { PublicKey } from "@solana/web3.js";
export interface RentFreeAccountInstruction {
    newPubicKey: PublicKey;
    programID: PublicKey;
    space: number;
}
export interface TransferInstructionParams {
    to: PublicKey;
    amount: number;
}
export declare class System {
    private wallet;
    constructor(wallet: Wallet);
    accountInfo(pubkey: PublicKey): Promise<import("@solana/web3.js").AccountInfo<Buffer> | null>;
    createRentFreeAccountInstruction(params: RentFreeAccountInstruction): Promise<import("@solana/web3.js").TransactionInstruction>;
    createTransferInstruction(params: TransferInstructionParams): import("@solana/web3.js").TransactionInstruction;
}
