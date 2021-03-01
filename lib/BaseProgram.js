"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProgram = void 0;
const web3_js_1 = require("@solana/web3.js");
const getUnixTs = () => {
    return new Date().getTime() / 1000;
};
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
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
    async sendTx(insts, signers = [], commitment = 'singleGossip', timeout = 15000) {
        const tx = new web3_js_1.Transaction();
        for (let inst of insts) {
            tx.add(inst);
        }
        tx.recentBlockhash = (await this.conn.getRecentBlockhash(commitment)).blockhash;
        tx.setSigners(...signers.map((account) => account.publicKey));
        tx.sign(...signers);
        const rawTx = tx.serialize();
        const startTime = getUnixTs();
        const txid = await this.conn.sendRawTransaction(rawTx, {
            skipPreflight: true,
        });
        console.log('Started awaiting confirmation for', txid);
        let done = false;
        (async () => {
            while (!done && getUnixTs() - startTime < timeout) {
                this.conn.sendRawTransaction(rawTx, {
                    skipPreflight: true
                });
                await sleep(300);
            }
        })();
        try {
            await awaitTransactionSignatureConfirmation(txid, timeout, this.conn);
        }
        catch (err) {
            if (err.timeout) {
                throw new Error('Timed out awaiting confirmation on transaction');
            }
            let simulateResult = null;
            try {
                simulateResult = (await simulateTransaction(this.conn, tx, 'singleGossip')).value;
            }
            catch (e) {
            }
            if (simulateResult && simulateResult.err) {
                if (simulateResult.logs) {
                    for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
                        const line = simulateResult.logs[i];
                        if (line.startsWith('Program log: ')) {
                            throw new Error('Transaction failed: ' + line.slice('Program log: '.length));
                        }
                    }
                }
                throw new Error(JSON.stringify(simulateResult.err));
            }
            throw new Error('Transaction failed');
        }
        finally {
            done = true;
        }
        console.log('Latency', txid, getUnixTs() - startTime);
        return txid;
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
    // FIXME: @solana/web3.js and solray may import different versions of PublicKey, causing
    // the typecheck here to fail. Let's just compare constructor name for now -.-
    if (auth.constructor.name == web3_js_1.Account.name) {
        return {
            pubkey: auth.publicKey,
            isSigner: true,
            isWritable,
        };
    }
    else if (auth.constructor.name == web3_js_1.PublicKey.name) {
        return {
            pubkey: auth,
            isSigner: false,
            isWritable,
        };
    }
    throw new Error(`Invalid instruction authority. Expect Account | PublicKey`);
}
async function awaitTransactionSignatureConfirmation(txid, timeout, connection) {
    let done = false;
    const result = await new Promise((resolve, reject) => {
        (async () => {
            setTimeout(() => {
                if (done) {
                    return;
                }
                done = true;
                console.log('Timed out for txid', txid);
                reject({ timeout: true });
            }, timeout);
            try {
                connection.onSignature(txid, (result) => {
                    console.log('WS confirmed', txid, result);
                    done = true;
                    if (result.err) {
                        reject(result.err);
                    }
                    else {
                        resolve(result);
                    }
                }, 'recent');
                console.log('Set up WS connection', txid);
            }
            catch (e) {
                done = true;
                console.log('WS error in setup', txid, e);
            }
            while (!done) {
                // eslint-disable-next-line no-loop-func
                (async () => {
                    try {
                        const signatureStatuses = await connection.getSignatureStatuses([
                            txid,
                        ]);
                        const result = signatureStatuses && signatureStatuses.value[0];
                        if (!done) {

                            if (!result) {
                                // console.log('REST null result for', txid, result);
                            } else if (result.err) {
                                console.log('REST error for', txid, result);
                                done = true;
                                reject(result.err);
                            } else if (!(result.confirmations || result.confirmationStatus === "confirmed" || result.confirmationStatus === "finalized")) {
                                console.log('REST not confirmed', txid, result);
                            } else {
                                console.log('REST confirmed', txid, result);
                                done = true;
                                resolve(result);
                            }
                        }
                    }
                    catch (e) {
                        if (!done) {
                            console.log('REST connection error: txid', txid, e);
                        }
                    }
                })();
                await sleep(300);
            }
        })();
    });
    done = true;
    return result;
}
async function simulateTransaction(connection, transaction, commitment) {
    // @ts-ignore
    transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching);
    const signData = transaction.serializeMessage();
    // @ts-ignore
    const wireTransaction = transaction._serialize(signData);
    const encodedTransaction = wireTransaction.toString('base64');
    const config = { encoding: 'base64', commitment };
    const args = [encodedTransaction, config];
    // @ts-ignore
    const res = await connection._rpcRequest('simulateTransaction', args);
    if (res.error) {
        throw new Error('failed to simulate transaction: ' + res.error.message);
    }
    return res.result;
}
