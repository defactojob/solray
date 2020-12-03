"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
const web3_js_1 = require("@solana/web3.js");
class System {
    constructor(wallet) {
        this.wallet = wallet;
    }
    accountInfo(pubkey) {
        return this.wallet.conn.getAccountInfo(pubkey);
    }
    async createRentFreeAccountInstruction(params) {
        const balance = await this.wallet.conn.getMinimumBalanceForRentExemption(params.space);
        return web3_js_1.SystemProgram.createAccount({
            fromPubkey: this.wallet.account.publicKey,
            newAccountPubkey: params.newPubicKey,
            lamports: balance,
            space: params.space,
            programId: params.programID,
        });
    }
    createTransferInstruction(params) {
        const { to, amount } = params;
        return web3_js_1.SystemProgram.transfer({
            fromPubkey: this.wallet.account.publicKey,
            toPubkey: to,
            lamports: amount,
        });
    }
}
exports.System = System;
