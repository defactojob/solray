/// <reference types="node" />
import { PublicKey, TransactionInstruction, Account, Connection, Commitment } from "@solana/web3.js";
import { Wallet } from '.';
import BufferLayout from 'buffer-layout';
export declare abstract class BaseProgram {
    protected wallet: Wallet;
    programID: PublicKey;
    constructor(wallet: Wallet, programID: PublicKey);
    protected get conn(): Connection;
    protected get account(): Account;
    protected get pubkey(): PublicKey;
    protected sendTx(insts: TransactionInstruction[], signers?: Account[], commitment?: Commitment, timeout?: number): Promise<string>;
    protected instructionEncode(layout: BufferLayout, data: any, authorities?: InstructionAuthority[]): TransactionInstruction;
    protected instruction(data: Buffer, authorities?: InstructionAuthority[]): TransactionInstruction;
}
export declare type InstructionAuthority = Account | Account[] | PublicKey[] | PublicKey | {
    write: PublicKey | Account;
};
