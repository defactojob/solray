"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramAccount = void 0;
const web3_js_1 = require("@solana/web3.js");
// ProgramAccount generates a pubkey that a program may use to invoke another program.
class ProgramAccount {
    // the nonced seed must generate a program pubkey not on the ed25539 curve
    // static async fromSeed(seed: Buffer, programID: PublicKey): Promise<ProgramAccount> {
    //   // would throw an error if generated address is on ed25539 curve
    //   const pubkey = await PublicKey.createProgramAddress([seed], programID)
    //   return new ProgramAccount(pubkey, seed, programID)
    // }
    // The nonced seed must generate a program pubkey not on the ed25539 curve
    constructor(pubkey, noncedSeed, programID) {
        this.pubkey = pubkey;
        this.noncedSeed = noncedSeed;
        this.programID = programID;
    }
    // NB: for simplicity, only support nonced seeds. In rust use the corresponding
    // function `Pubkey::find_program_address(&[&seed], &program_id);`
    static async forSeed(seed, programID) {
        // There is ~50% probability that any given seed would fail to generate a point
        // not on the ed25539 curve. `findProgramAddress` would decrement a nonce
        // to find a working seed.
        const [pubkey, nonce] = await web3_js_1.PublicKey.findProgramAddress([seed], programID);
        // copy the original seed and append the nonce in the last position
        const noncedSeed = Buffer.alloc(seed.length + 1);
        seed.copy(noncedSeed);
        noncedSeed[seed.length] = nonce;
        return new ProgramAccount(pubkey, noncedSeed, programID);
    }
    get address() {
        return this.pubkey.toBase58();
    }
    get nonce() {
        return this.noncedSeed[this.noncedSeed.length - 1];
    }
}
exports.ProgramAccount = ProgramAccount;
