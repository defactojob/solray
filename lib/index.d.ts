import { Connection } from "@solana/web3.js";
export { Account, PublicKey } from "@solana/web3.js";
export { Wallet } from "./Wallet";
export { SPLToken } from "./SPLToken";
export { ProgramAccount } from "./ProgramAccount";
export { BaseProgram } from "./BaseProgram";
export { BPFLoader } from "./BPFLoader";
export { System } from "./System";
export { Deployer } from "./Deployer";
export declare type NetworkName = "local" | "dev" | "main";
export declare namespace solana {
    function connect(networkName: NetworkName, opts?: {
        commitment?: string;
    }): Connection;
}
