import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
  Account,
  Connection, Commitment, TransactionSignature, SimulatedTransactionResponse, RpcResponseAndContext,
} from "@solana/web3.js"

import { Wallet } from '.';

import BufferLayout from 'buffer-layout';

const getUnixTs = () => {
  return new Date().getTime() / 1000;
}
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// BaseProgram offers some sugar around interacting with a program. Extend this abstract
// class with program specific instructions.
export abstract class BaseProgram {
  constructor(protected wallet: Wallet, public programID: PublicKey) { }

  protected get conn(): Connection {
    return this.wallet.conn
  }

  protected get account(): Account {
    return this.wallet.account
  }

  protected get pubkey(): PublicKey {
    return this.wallet.pubkey
  }


  // sendTx sends and confirm instructions in a transaction. It automatically adds
  // the wallet's account as a signer to pay for the transaction.
  protected async sendTx(
    insts: TransactionInstruction[],
    signers: Account[] = [],
    commitment: Commitment = 'singleGossip',
    timeout = 15000
  ): Promise<string> {
    const tx = new Transaction()

    for (let inst of insts) {
      tx.add(inst)
    }

    tx.recentBlockhash = (await this.conn.getRecentBlockhash(commitment)).blockhash
    tx.setSigners(...signers.map((account) => account.publicKey))
    tx.sign(...signers)
    const rawTx = tx.serialize()
    const startTime = getUnixTs();

    const txid: TransactionSignature = await this.conn.sendRawTransaction(
      rawTx,
      {
        skipPreflight: true,
      },
    );
    console.log('Started awaiting confirmation for', txid);
    let done = false;
    (async () => {
      while (!done && getUnixTs() - startTime < timeout / 1000) {
        this.conn.sendRawTransaction(rawTx, {
          skipPreflight: true
        });
        await sleep(300);
      }
    })();

    try {
      await awaitTransactionSignatureConfirmation(txid, timeout, this.conn);
    } catch (err) {
      if (err.timeout) {
        throw new Error('Timed out awaiting confirmation on transaction');
      }
      let simulateResult: SimulatedTransactionResponse | null = null;
      try {
        simulateResult = (
          await simulateTransaction(this.conn, tx, 'singleGossip')
        ).value;
      } catch (e) {

      }
      if (simulateResult && simulateResult.err) {
        if (simulateResult.logs) {
          for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
            const line = simulateResult.logs[i];
            if (line.startsWith('Program log: ')) {
              throw new Error(
                'Transaction failed: ' + line.slice('Program log: '.length),
              );
            }
          }
        }
        throw new Error(JSON.stringify(simulateResult.err));
      }
      throw new Error('Transaction failed');
    } finally {
      done = true;
    }

    console.log('Latency', txid, getUnixTs() - startTime);
    return txid;
  }

  protected instructionEncode(
    layout: BufferLayout,
    data: any,
    authorities: InstructionAuthority[] = []): TransactionInstruction {
    const buffer = Buffer.alloc(layout.span);
    layout.encode(data, buffer)

    return this.instruction(buffer, authorities)
  }

  protected instruction(
    data: Buffer,
    authorities: InstructionAuthority[] = []): TransactionInstruction {
    return new TransactionInstruction({
      keys: authsToKeys(authorities),
      programId: this.programID,
      data,
    })
  }
}

export type InstructionAuthority = Account | Account[] | PublicKey[] | PublicKey | { write: PublicKey | Account }

function authsToKeys(auths: InstructionAuthority[]): InstructionKey[] {
  const keys: InstructionKey[] = []

  for (let auth of auths) {
    if (auth instanceof Array) {
      auth.forEach(a =>  keys.push(authToKey(a, false)));
    } else {
      keys.push(
        authToKey(auth['write'] || auth, !!auth['write'])
      );
    }
  }
  return keys
}

function authToKey(auth: Account | PublicKey, isWritable = false): InstructionKey {
  // FIXME: @solana/web3.js and solray may import different versions of PublicKey, causing
  // the typecheck here to fail. Let's just compare constructor name for now -.-
  if (auth.constructor.name == Account.name) {
    return {
      pubkey: (auth as Account).publicKey,
      isSigner: true,
      isWritable,
    }
  } else if (auth.constructor.name == PublicKey.name) {
    return {
      pubkey: (auth as PublicKey),
      isSigner: false,
      isWritable,
    }
  }

  throw new Error(`Invalid instruction authority. Expect Account | PublicKey`)
}

interface InstructionKey {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}


async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
) {
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
        connection.onSignature(
          txid,
          (result) => {
            // console.log('WS confirmed', txid, result);
            done = true;
            if (result.err) {
              reject(result.err);
            } else {
              resolve(result);
            }
          },
          'singleGossip',
        );
        // console.log('Set up WS connection', txid);
      } catch (e) {
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
          } catch (e) {
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

async function simulateTransaction(
  connection: Connection,
  transaction: Transaction,
  commitment: Commitment,
): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
  // @ts-ignore
  transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching,
  );

  const signData = transaction.serializeMessage();
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData);
  const encodedTransaction = wireTransaction.toString('base64');
  const config: any = { encoding: 'base64', commitment };
  const args = [encodedTransaction, config];

  // @ts-ignore
  const res = await connection._rpcRequest('simulateTransaction', args);
  if (res.error) {
    throw new Error('failed to simulate transaction: ' + res.error.message);
  }
  return res.result;
}