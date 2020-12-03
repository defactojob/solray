"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BPFLoader = void 0;
const web3_js_1 = require("@solana/web3.js");
class BPFLoader {
    constructor(wallet, programID = BPFLoader.programID) {
        this.wallet = wallet;
        this.programID = programID;
    }
    async load(programBinary, programAccount = new web3_js_1.Account()) {
        await web3_js_1.BpfLoader.load(this.wallet.conn, this.wallet.account, programAccount, programBinary, this.programID);
        return programAccount;
    }
}
exports.BPFLoader = BPFLoader;
BPFLoader.programID = web3_js_1.BPF_LOADER_PROGRAM_ID;
