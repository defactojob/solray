"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProgram = void 0;
const web3_js_1 = require("@solana/web3.js");
// BaseProgram offers some sugar around interacting with a program. Extend this abstract
// class with program specific instructions.
class BaseProgram {
    constructor(wallet, programID) {
        this.wallet = wallet;
        this.programID = programID;
    }
    get conn() {
        return this.wallet.conn;
    }
    get account() {
        return this.wallet.account;
    }
    get pubkey() {
        return this.wallet.pubkey;
    }
    // sendTx sends and confirm instructions in a transaction. It automatically adds
    // the wallet's account as a signer to pay for the transaction.
    async sendTx(insts, signers = []) {
        const tx = new web3_js_1.Transaction();
        for (let inst of insts) {
            tx.add(inst);
        }
        return await web3_js_1.sendAndConfirmTransaction(this.conn, tx, signers, {
            commitment: this.conn.commitment,
            preflightCommitment: this.conn.commitment
        });
    }
    instructionEncode(layout, data, authorities = []) {
        const buffer = Buffer.alloc(layout.span);
        layout.encode(data, buffer);
        return this.instruction(buffer, authorities);
    }
    instruction(data, authorities = []) {
        return new web3_js_1.TransactionInstruction({
            keys: authsToKeys(authorities),
            programId: this.programID,
            data,
        });
    }
}
exports.BaseProgram = BaseProgram;
function authsToKeys(auths) {
    const keys = [];
    for (let auth of auths) {
        if (auth instanceof Array) {
            auth.forEach(a => keys.push(authToKey(a, false)));
        }
        else {
            keys.push(authToKey(auth['write'] || auth, !!auth['write']));
        }
    }
    return keys;
}
function authToKey(auth, isWritable = false) {
    if (auth.constructor == web3_js_1.Account) {
        return {
            pubkey: auth.publicKey,
            isSigner: true,
            isWritable,
        };
    }
    else if (auth.constructor == web3_js_1.PublicKey) {
        return {
            pubkey: auth,
            isSigner: false,
            isWritable,
        };
    }
    throw new Error(`Invalid instruction authority. Expect Account | PublicKey`);
}
