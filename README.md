# soldo

DApp Toolkit for Solana.

## Connection

Example: Connect to Solana `devnet` RPC:

```
const conn = solana.connect("dev")
```

See: [`@solana/web3.js` Connection](https://solana-labs.github.io/solana-web3.js/class/src/connection.js~Connection.html)

## Wallet

### Example: Generate a random mnemonic wallet

```js
const conn = solana.connect("dev")
const mnemonic = Wallet.generateMnemonic()
const wallet = await Wallet.fromMnemonic(mnemonic, conn)
```

### Example: Request airdrop into a wallet

```js
const conn = solana.connect("dev")
const mnemonic = "spin canyon tuition upset pioneer celery liquid conduct boy bargain dust seed"
const wallet = await Wallet.fromMnemonic(mnemonic, conn)
console.log(wallet.address)

await conn.requestAirdrop(wallet.pubkey, 1e9)
```

Visit explorer to see account info:

[https://explorer.solana.com/address/4i7YkLD9RiiACd4gbG9HdTUUH2wTfTycuRwB8GcehzMd?cluster=devnet](https://explorer.solana.com/address/4i7YkLD9RiiACd4gbG9HdTUUH2wTfTycuRwB8GcehzMd?cluster=devnet)

### Example: Derive sub-accounts from a master seed.

```js
const conn = solana.connect("dev")
const mnemonic = "spin canyon tuition upset pioneer celery liquid conduct boy bargain dust seed"
const wallet = await Wallet.fromMnemonic(mnemonic, conn)

for (let i = 0; i < 10; i++) {
  // generate a subwallet on a hardened path
  const subwallet = wallet.derive(`${i}'`)
  console.log(i, subwallet.address)
}
```

Outputs:

```
0 GziwkGpdZDhfGiVm6XbhHE7AxqWz3jsFqcj8RgS9vkjp
1 BiZj86nxypouBDuuzv4uzzsdwQHiMGK7v1RA3JqAhwqE
2 vTwNcpSuZ9uKBBm4KzGsF7bNmBTqXCo5KvK88LZVhCX
3 9A6c6CCekFfcMt2uhjhNMoZnHnNMW5sDqEUVPHb8FW1N
4 FDnToGeENVcF6NYAAedGAn8ZoXbf3vDuVzE7GsCyegD9
5 Ef413p9kVUSPmwJbcmHwF8b8YUDiiNCs5F4jQdfv3bzx
6 CFt5muH2K53VFd7Fi5W7s8LhrJnNZZidm9tRNA671k1G
7 GMC8dHpXHnMteKSpiFbD1d6v9Kxx3y2GCXAaFFtfrKoX
8 g3FjgBPctNjhQA5639oR7gk2dpVFkkePBo71rzGJ9u1
9 8dUEQMXWoiWve3xh1Udq1NWY9WynFXhE6o6jUkeF5Y4N
```

## BaseProgram

The `BaseProgram` is an abstract class that you can extend to build concise API that interacts with programs deployed on Solana.

The `BaseProgram` constructor requires `Wallet` and the `programID`, so that an instance of base program will use the wallet's account to sign transactions, as well as using the specified programID to create instructions.

### Example: Faucet Program

```ts
// Create an instance of the Faucet program
const faucet = new Faucet(wallet, facuetProgramID)

// Request the faucet to send tokens a receiver
await faucet.request({
  receiver: receiver.pubkey,
  tokenAccount: faucetTokenAccountPubkey,
  tokenOwner: faucetTokenOwner,
})
```

The `Faucet` program extends `BaseProgram`:

```ts
import {
  PublicKey,
  BaseProgram,
  ProgramAccount,
  SPLToken,
} from "soldo"

interface RequestParams {
  receiver: PublicKey
  tokenAccount: PublicKey
  tokenOwner: ProgramAccount
}

export class Faucet extends BaseProgram {
  public async request(params: RequestParams) {
    return this.sendTx([
      // instructions
      this.requestInstruction(params),
    ], [
      // signers
      this.account,
    ])
  }

  private requestInstruction(params: RequestParams) {
    const data = params.tokenOwner.noncedSeed

    return this.instruction(data, [
      // writable: true, isSigned: false
      { write: params.receiver },
      // writable: false, isSigned: false
      SPLToken.programID,
      // writable: true, isSigned: false
      { write: params.tokenAccount },
      // writable: false, isSigned: false
      params.tokenOwner.pubkey,
    ])
  }
}
```

## Build

If you installed Solray globally, you can build program by running:

```bash
$ solary build <program> [path]
```

The script will auto download or update build sdk. 

*SDK version is based on your `testnetDefaultChannel` in  package.json*