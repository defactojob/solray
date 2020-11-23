import { TransactionInstruction, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';


import { Wallet } from './Wallet';
import { System } from './System';
import { Account, PublicKey } from '.';
import { BaseProgram } from './BaseProgram';

import BufferLayout from 'buffer-layout';

import { uint64, u64LEBuffer, u64FromBuffer, publicKey } from './util/encoding';

export const MintLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u32('mintAuthorityOption'),
  publicKey('mintAuthority'),
  uint64('supply'),
  BufferLayout.u8('decimals'),
  BufferLayout.u8('isInitialized'),
  BufferLayout.u32('freezeAuthorityOption'),
  publicKey('freezeAuthority'),
]);

export const AccountLayout: typeof BufferLayout.Structure = BufferLayout.struct(
  [
    publicKey('mint'),
    publicKey('owner'),
    uint64('amount'),
    BufferLayout.u32('delegateOption'),
    publicKey('delegate'),
    BufferLayout.u8('state'),
    BufferLayout.u32('isNativeOption'),
    uint64('isNative'),
    uint64('delegatedAmount'),
    BufferLayout.u32('closeAuthorityOption'),
    publicKey('closeAuthority'),
  ],
);

export interface InitMintParams {
  freezeAuthority?: PublicKey
  mintAuthority: PublicKey
  decimals: number

  account?: Account
}

export interface InitMintInstructionParams extends InitMintParams {
  token: PublicKey
}

export interface InitAccountParams {
  token: PublicKey
  owner: PublicKey
  account?: Account
}

export interface InitAccountInstructionParams {
  account: PublicKey
  token: PublicKey
  owner: PublicKey
}

export interface InitWrappedNativeAccountParams {
  amount: number
  owner: PublicKey
  account?: Account
}

export interface MintToParams {
  token: PublicKey
  to: PublicKey
  amount: bigint
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface ApproveParams {
  account: PublicKey
  delegate: PublicKey
  amount: bigint
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface Approve2Params {
  token: PublicKey
  account: PublicKey
  delegate: PublicKey
  amount: bigint
  decimals: number
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface RevokeParams {
  account: PublicKey
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface BurnParams {
  token: PublicKey
  from: PublicKey
  amount: bigint
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface TransferParams {
  from: PublicKey
  to: PublicKey
  amount: bigint
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface Transfer2Params {
  from: PublicKey
  to: PublicKey
  token: PublicKey
  amount: bigint
  decimals: number,
  authority: Account | PublicKey
  multiSigners: Account[]
}

type AuthorityType =
  | 'MintTokens'
  | 'FreezeAccount'
  | 'AccountOwner'
  | 'CloseAccount';

const AuthorityTypeCodes = {
  MintTokens: 0,
  FreezeAccount: 1,
  AccountOwner: 2,
  CloseAccount: 3,
};

export interface SetAuthorityParams {
  account: PublicKey
  newAuthority: PublicKey | null,
  authorityType: AuthorityType,
  currentAuthority: Account | PublicKey
  multiSigners: Account[]
}

export interface CloseAccountParams {
  account: PublicKey
  dest: PublicKey,
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface FreezeAccountParams {
  token: PublicKey
  account: PublicKey
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface ThawAccountParams {
  token: PublicKey
  account: PublicKey
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface MintTo2Params {
  token: PublicKey
  to: PublicKey
  amount: bigint
  decimals: number
  authority: Account | PublicKey
  multiSigners: Account[]
}

export interface MintToInstructionParams extends MintToParams {
}

export interface ApproveInstructionParams extends ApproveParams {
}

export interface Approve2InstructionParams extends Approve2Params {
}

export interface RevokeInstructionParams extends RevokeParams {
}

export interface BurnInstructionParams extends BurnParams {
}

export interface TransferInstructionParams extends TransferParams {
}

export interface Transfer2InstructionParams extends Transfer2Params {
}

export interface SetAuthorityInstructionParams extends SetAuthorityParams {
}

export interface CloseAccountInstructionParams extends CloseAccountParams {
}

export interface FreezeAccountInstructionParams extends FreezeAccountParams {
}

export interface ThawAccountInstructionParams extends ThawAccountParams {
}

export interface MintTo2InstructionParams extends MintTo2Params {
}

export type MintInfo = {
  mintAuthority: null | PublicKey;
  supply: bigint;
  decimals: number;
  isInitialized: boolean;
  freezeAuthority: null | PublicKey;
};

export type AccountInfo = {
  mint: PublicKey;
  owner: PublicKey;
  amount: bigint;
  delegate: null | PublicKey;
  delegatedAmount: bigint;
  isInitialized: boolean;
  isFrozen: boolean;
  isNative: boolean;
  rentExemptReserve: null | bigint;
  closeAuthority: null | PublicKey;
};

const MultisigLayout = BufferLayout.struct([
  BufferLayout.u8('m'),
  BufferLayout.u8('n'),
  BufferLayout.u8('is_initialized'),
  publicKey('signer1'),
  publicKey('signer2'),
  publicKey('signer3'),
  publicKey('signer4'),
  publicKey('signer5'),
  publicKey('signer6'),
  publicKey('signer7'),
  publicKey('signer8'),
  publicKey('signer9'),
  publicKey('signer10'),
  publicKey('signer11'),
]);

/**
 * Information about an multisig
 */
type MultisigInfo = {
  /**
   * The number of signers required
   */
  m: number,

  /**
   * Number of possible signers, corresponds to the
   * number of `signers` that are valid.
   */
  n: number,

  /**
   * Is this mint initialized
   */
  initialized: boolean,

  /**
   * The signers
   */
  signer1: PublicKey,
  signer2: PublicKey,
  signer3: PublicKey,
  signer4: PublicKey,
  signer5: PublicKey,
  signer6: PublicKey,
  signer7: PublicKey,
  signer8: PublicKey,
  signer9: PublicKey,
  signer10: PublicKey,
  signer11: PublicKey,
};

// The address of the special mint for wrapped native token.
export const NATIVE_MINT: PublicKey = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

export class SPLToken extends BaseProgram {
  static programID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

  private sys: System
  constructor(wallet: Wallet, programID = SPLToken.programID) {
    super(wallet, programID)
    this.sys = new System(this.wallet)
  }

  /**
   * Retrieve mint information
   * 
   * @param token Public key of the token
   */
  public async mintInfo(token: PublicKey): Promise<MintInfo> {
    const info = await this.wallet.conn.getAccountInfo(token);
    if (info === null) {
      throw new Error('Failed to find mint account');
    }
    if (!info.owner.equals(this.programID)) {
      throw new Error(`Invalid mint owner: ${JSON.stringify(info.owner)}`);
    }
    if (info.data.length != MintLayout.span) {
      throw new Error(`Invalid mint size`);
    }

    const data = Buffer.from(info.data);
    const mintInfo = MintLayout.decode(data);

    if (mintInfo.mintAuthorityOption === 0) {
      mintInfo.mintAuthority = null;
    } else {
      mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
    }

    mintInfo.supply = mintInfo.supply.readBigUInt64LE();
    mintInfo.isInitialized = mintInfo.isInitialized != 0;

    if (mintInfo.freezeAuthorityOption === 0) {
      mintInfo.freezeAuthority = null;
    } else {
      mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
    }
    return mintInfo;
  }

  /**
   * Retrieve account information
   *
   * @param account Public key of the account
   */
  public async accountInfo(account: PublicKey): Promise<AccountInfo> {
    const info = await this.conn.getAccountInfo(account);
    if (info === null) {
      throw new Error('Failed to find account');
    }
    if (!info.owner.equals(this.programID)) {
      throw new Error(`Invalid account owner`);
    }
    if (info.data.length != AccountLayout.span) {
      throw new Error(`Invalid account size`);
    }

    const data = Buffer.from(info.data);
    const accountInfo = AccountLayout.decode(data);
    accountInfo.mint = new PublicKey(accountInfo.mint);
    accountInfo.owner = new PublicKey(accountInfo.owner);
    accountInfo.amount = u64FromBuffer(accountInfo.amount);

    if (accountInfo.delegateOption === 0) {
      accountInfo.delegate = null;
      accountInfo.delegatedAmount = BigInt(0);
    } else {
      accountInfo.delegate = new PublicKey(accountInfo.delegate);
      accountInfo.delegatedAmount = u64FromBuffer(accountInfo.delegatedAmount);
    }

    accountInfo.isInitialized = accountInfo.state !== 0;
    accountInfo.isFrozen = accountInfo.state === 2;

    if (accountInfo.isNativeOption === 1) {
      accountInfo.rentExemptReserve = u64FromBuffer(accountInfo.isNative);
      accountInfo.isNative = true;
    } else {
      accountInfo.rentExemptReserve = null;
      accountInfo.isNative = false;
    }

    if (accountInfo.closeAuthorityOption === 0) {
      accountInfo.closeAuthority = null;
    } else {
      accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
    }

    return accountInfo;
  }

  /**
   * Retrieve Multisig information
   *
   * @param multisig Public key of the account
   */
  async multisigInfo(multisig: PublicKey): Promise<MultisigInfo> {
    const info = await this.conn.getAccountInfo(multisig);
    if (info === null) {
      throw new Error('Failed to find multisig');
    }
    if (!info.owner.equals(this.programID)) {
      throw new Error(`Invalid multisig owner`);
    }
    if (info.data.length != MultisigLayout.span) {
      throw new Error(`Invalid multisig size`);
    }

    const data = Buffer.from(info.data);
    const multisigInfo = MultisigLayout.decode(data);
    multisigInfo.signer1 = new PublicKey(multisigInfo.signer1);
    multisigInfo.signer2 = new PublicKey(multisigInfo.signer2);
    multisigInfo.signer3 = new PublicKey(multisigInfo.signer3);
    multisigInfo.signer4 = new PublicKey(multisigInfo.signer4);
    multisigInfo.signer5 = new PublicKey(multisigInfo.signer5);
    multisigInfo.signer6 = new PublicKey(multisigInfo.signer6);
    multisigInfo.signer7 = new PublicKey(multisigInfo.signer7);
    multisigInfo.signer8 = new PublicKey(multisigInfo.signer8);
    multisigInfo.signer9 = new PublicKey(multisigInfo.signer9);
    multisigInfo.signer10 = new PublicKey(multisigInfo.signer10);
    multisigInfo.signer11 = new PublicKey(multisigInfo.signer11);

    return multisigInfo;
  }

  /**
   * Creates a new token with zero supply
   *
   * @param mintAuthority Account or multisig that will control minting
   * @param freezeAuthority Optional account or multisig that can freeze token accounts
   * @param decimals Location of the decimal place
   * @return Token object for the newly minted token
   */
  public async initializeMint(params: InitMintParams): Promise<Account> {
    const account = params.account || new Account()

    await this.sendTx([
      await this.sys.createRentFreeAccountInstruction({
        newPubicKey: account.publicKey,
        programID: this.programID,
        space: MintLayout.span
      }),
      this.initMintInstruction({
        token: account.publicKey,
        ...params,
      })
    ], [this.account, account])

    return account
  }

  private initMintInstruction(params: InitMintInstructionParams): TransactionInstruction {
    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('decimals'),
      publicKey('mintAuthority'),
      BufferLayout.u8('option'),
      publicKey('freezeAuthority'),
    ]);

    const { token, decimals, mintAuthority, freezeAuthority } = params;

    return this.instructionEncode(layout, {
      instruction: 0, // InitializeMint instruction
      decimals,
      mintAuthority: mintAuthority.toBuffer(),
      option: !freezeAuthority ? 0 : 1,
      freezeAuthority: (freezeAuthority || new PublicKey(0)).toBuffer(),
    }, [
      { write: token },
      SYSVAR_RENT_PUBKEY,
    ]);
  }

  /**
   * Creates an account to hold token balance
   *
   * This account may then be used as a `transfer()` or `approve()` destination
   *
   * @param owner User account that will own the new account
   * @return Public key of the new empty account
   */
 
  public async initializeAccount(params: InitAccountParams): Promise<Account> {
    const account = params.account || new Account();

    await this.sendTx([
      await this.sys.createRentFreeAccountInstruction({
        newPubicKey: account.publicKey,
        programID: this.programID,
        space: AccountLayout.span
      }),
      this.initAccountInstruction({
        account: account.publicKey,
        token: params.token,
        owner: params.owner,
      })
    ], [this.account, account]);

    return account;
  }

  private initAccountInstruction(params: InitAccountInstructionParams): TransactionInstruction {
    const layout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    return this.instructionEncode(layout, { instruction: 1 }, [
      { write: params.account },
      params.token,
      params.owner,
      SYSVAR_RENT_PUBKEY,
    ]);
  }

  /**
   * Create and initialize a new account on the special native token mint.
   *
   * In order to be wrapped, the account must have a balance of native tokens
   * when it is initialized with the token program.
   *
   * This function sends lamports to the new account before initializing it.
   *
   * @param onwer The owner of the new token account
   * @param amount The amount of lamports to wrap
   * @return {Promise<PublicKey>} The new token account
   */
  public async initializeWrappedNativeAccount(params: InitWrappedNativeAccountParams): Promise<Account> {
    const account = params.account || new Account();

    await this.sendTx([
      await this.sys.createRentFreeAccountInstruction({
        newPubicKey: account.publicKey,
        programID: this.programID,
        space: AccountLayout.span
      }),
      this.sys.createTransferInstruction({
        to: account.publicKey,
        amount: params.amount,
      }),
      this.initAccountInstruction({
        account: account.publicKey,
        token: NATIVE_MINT,
        owner: params.owner,
      })
    ], [this.account, account]);
    
    return account;
  }

  /**
   * Mint new tokens
   *
   * @param token To mint token
   * @param amount Amount to mint
   * @param to Public key of the account to mint to
   * @param authority Minting authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   */
  public async mintTo(params: MintToParams): Promise<void> {
    const { authority, multiSigners } = params;
    
    const signers = authority.constructor == Account ? [authority] : multiSigners

    await this.sendTx([this.mintToInstruction(params)], [this.account, ...signers])
  }

  private mintToInstruction(params: MintToInstructionParams): TransactionInstruction {
    const {
      token,
      amount,
      to,
      authority,
      multiSigners,
    } = params

    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      uint64('amount'),
    ])

    return this.instructionEncode(layout, {
      instruction: 7, // MintTo instruction
      amount: u64LEBuffer(amount),
    }, [
      { write: token },
      { write: to },
      authority,
      multiSigners
    ]);

  }

  /**
   * Construct an Approve instruction
   *
   * @param amount Maximum number of tokens the delegate may transfer
   * @param account Public key of the account
   * @param delegate Account authorized to perform a transfer of tokens from the source account
   * @param authority Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  public async approve(params: ApproveParams): Promise<void> {
    const { authority, multiSigners } = params;
    
    const signers = authority.constructor == Account ? [authority] : multiSigners

    await this.sendTx([this.approveInstruction(params)], [this.account, ...signers]);
  }

  private approveInstruction(params: ApproveInstructionParams): TransactionInstruction {
    const {
      amount,
      account,
      delegate,
      authority,
      multiSigners,
    } = params;

    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      uint64('amount'),
    ]);
    
    return this.instructionEncode(layout, {
      instruction: 4, // Approve instruction
      amount: u64LEBuffer(amount),
    }, [
      { write: account },
      delegate,
      authority,
      multiSigners
    ]);

  }

  /**
   * Remove approval for the transfer of any remaining tokens
   *
   * @param account Public key of the account
   * @param authority Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  public async revoke(params: RevokeParams): Promise<void> {
    const { authority, multiSigners } = params;

    const signers = authority.constructor == Account ? [authority] : multiSigners

    await this.sendTx([this.revokeInstruction(params)], [this.account, ...signers]);
  }

  private revokeInstruction(params: RevokeInstructionParams): TransactionInstruction {
    const { account, authority, multiSigners } = params;

    const layout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    return this.instructionEncode(layout, { instruction: 5 }, [
      { write: account },
      authority,
      multiSigners
    ]);
  }

  /**
   * Burn tokens
   *
   * @param token The token pubkey
   * @param from  Burn from account
   * @param amount Amount to burn
   * @param authority Account owner
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  public async burn(params: BurnParams): Promise<void> {
    const { authority, multiSigners } = params;

    const signers = authority.constructor == Account ? [authority] : multiSigners

    await this.sendTx([this.burnInstruction(params)], [this.account, ...signers]);
  }

  private burnInstruction(params: BurnInstructionParams): TransactionInstruction {
    const {
      token,
      from,
      amount,
      authority,
      multiSigners,
    } = params;

    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      uint64('amount'),
    ]);
    
    return this.instructionEncode(layout, {
      instruction: 8, // Burn instruction
      amount: u64LEBuffer(amount),
    }, [
      { write: from },
      { write: token },
      authority,
      multiSigners
    ]);

  }

  /**
   * Transfer tokens to another account
   *
   * @param from Source account
   * @param to Destination account
   * @param amount Number of tokens to transfer
   * @param authority Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  public async transfer(params: TransferParams): Promise<void> {
    const { authority, multiSigners } = params;

    const signers = authority.constructor == Account ? [authority] : multiSigners

    await this.sendTx([this.transferInstruction(params)], [this.account, ...signers]);
  }

  private transferInstruction(params: TransferInstructionParams): TransactionInstruction{
    const {
      from,
      to,
      amount,
      authority,
      multiSigners,
    } = params;
    
    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      uint64('amount'),
    ]);

    return this.instructionEncode(layout, {
      instruction: 3, // Transfer instruction
      amount: u64LEBuffer(amount),
    }, [
      { write: from },
      { write: to },
      authority,
      multiSigners
    ]);

  }

  /**
   * Assign a new authority to the account
   *
   * @param account Public key of the account
   * @param newAuthority New authority of the account
   * @param authorityType Type of authority to set
   * @param currentAuthority Current authority of the account
   * @param multiSigners Signing accounts if `currentAuthority` is a multiSig
   */
  public async setAuthority(params: SetAuthorityParams): Promise<void> {
    const { currentAuthority, multiSigners } = params;

    const signers = currentAuthority.constructor == Account ? [currentAuthority] : multiSigners;

    await this.sendTx([this.setAuthorityInstruction(params)], [this.account, ...signers]);
  }

  private setAuthorityInstruction(params: SetAuthorityInstructionParams): TransactionInstruction{
    const {
      account,
      newAuthority,
      authorityType,
      currentAuthority,
      multiSigners,
    } = params;
    
    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('authorityType'),
      BufferLayout.u8('option'),
      publicKey('newAuthority'),
    ]);

    return this.instructionEncode(layout, {
      instruction: 6, // SetAuthority instruction
      authorityType: AuthorityTypeCodes[authorityType],
      option: newAuthority === null ? 0 : 1,
      newAuthority: (newAuthority || new PublicKey('')).toBuffer(),
    }, [
      { write: account },
      currentAuthority,
      multiSigners
    ]);

  }

  /**
   * Close account
   *
   * @param account Account to close
   * @param dest Account to receive the remaining balance of the closed account
   * @param authority Authority which is allowed to close the account
   * @param multiSigners Signing accounts if `authority` is a multiSig
   */
  public async closeAccount(params: CloseAccountParams): Promise<void> {
    const { authority, multiSigners } = params;

    const signers = authority.constructor == Account ? [authority] : multiSigners;

    await this.sendTx([this.closeAccountInstruction(params)], [this.account, ...signers]);
  }

  private closeAccountInstruction(params: CloseAccountInstructionParams): TransactionInstruction{
    const {
      account,
      dest,
      authority,
      multiSigners,
    } = params;
    
    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
    ]);

    return this.instructionEncode(layout, {
      instruction: 9, // CloseAccount instruction
    }, [
      { write: account },
      { write: dest },
      authority,
      multiSigners
    ]);

  }

  /**
   * Freeze account
   * 
   * @param token The token public key
   * @param account Account to freeze
   * @param authority The mint freeze authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   */
  public async freezeAccount(params: FreezeAccountParams): Promise<void> {
    const { authority, multiSigners } = params;

    const signers = authority.constructor == Account ? [authority] : multiSigners;

    await this.sendTx([this.freezeAccountInstruction(params)], [this.account, ...signers]);
  }

  private freezeAccountInstruction(params: FreezeAccountInstructionParams): TransactionInstruction{
    const {
      token,
      account,
      authority,
      multiSigners,
    } = params;
    
    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
    ]);

    return this.instructionEncode(layout, {
      instruction: 10, // CloseAccount instruction
    }, [
      { write: account },
      token,
      authority,
      multiSigners
    ]);
  }

  /**
   * Thaw account
   *
   * @param account Account to thaw
   * @param authority The mint freeze authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   */
  public async thawAccount(params: ThawAccountParams): Promise<void> {
    const { authority, multiSigners } = params;

    const signers = authority.constructor == Account ? [authority] : multiSigners;

    await this.sendTx([this.thawAccountInstruction(params)], [this.account, ...signers]);
  }

  private thawAccountInstruction(params: ThawAccountInstructionParams): TransactionInstruction{
    const {
      token,
      account,
      authority,
      multiSigners,
    } = params;
    
    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
    ]);

    return this.instructionEncode(layout, {
      instruction: 11, // ThawAccount instruction
    }, [
      { write: account },
      token,
      authority,
      multiSigners
    ]);
  }

  /**
   * Transfer tokens to another account
   *
   * @param from Source account
   * @param to Destination account
   * @param token The token public key
   * @param amount Number of tokens to transfer
   * @param decimals Number of decimals in transfer amount
   * @param authority Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  public async transfer2(params: Transfer2Params): Promise<void> {
    const { authority, multiSigners } = params;

    const signers = authority.constructor == Account ? [authority] : multiSigners

    await this.sendTx([this.transfer2Instruction(params)], [this.account, ...signers]);
  }

  private transfer2Instruction(params: Transfer2InstructionParams): TransactionInstruction{
    const {
      from,
      to,
      token,
      amount,
      decimals,
      authority,
      multiSigners,
    } = params;
    
    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      uint64('amount'),
      BufferLayout.u8('decimals'),
    ]);

    return this.instructionEncode(layout, {
      instruction: 12, // Transfer2 instruction
      amount: u64LEBuffer(amount),
      decimals,
    }, [
      { write: from },
      token,
      { write: to },
      authority,
      multiSigners
    ]);

  }
  
  /**
   * Construct an Approve instruction
   * 
   * @param token The token public key
   * @param amount Maximum number of tokens the delegate may transfer
   * @param account Public key of the account
   * @param decimals Number of decimals in approve amount
   * @param delegate Account authorized to perform a transfer of tokens from the source account
   * @param authority Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  public async approve2(params: Approve2Params): Promise<void> {
    const { authority, multiSigners } = params;
    
    const signers = authority.constructor == Account ? [authority] : multiSigners

    await this.sendTx([this.approve2Instruction(params)], [this.account, ...signers]);
  }

  private approve2Instruction(params: Approve2InstructionParams): TransactionInstruction {
    const {
      token,
      amount,
      account,
      decimals,
      delegate,
      authority,
      multiSigners,
    } = params;

    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      uint64('amount'),
      BufferLayout.u8('decimals'),
    ]);
    
    return this.instructionEncode(layout, {
      instruction: 13, // Approve instruction
      amount: u64LEBuffer(amount),
      decimals,
    }, [
      { write: account },
      token,
      delegate,
      authority,
      multiSigners
    ]);

  }

  /**
   * Mint new tokens
   *
   * @param token To mint token
   * @param amount Amount to mint
   * @param decimals Number of decimals in amount to mint
   * @param to Public key of the account to mint to
   * @param authority Minting authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   */
  public async mintTo2(params: MintTo2Params): Promise<void> {
    const { authority, multiSigners } = params;
    
    const signers = authority.constructor == Account ? [authority] : multiSigners

    await this.sendTx([this.mintTo2Instruction(params)], [this.account, ...signers])
  }

  private mintTo2Instruction(params: MintTo2InstructionParams): TransactionInstruction {
    const {
      token,
      amount,
      decimals,
      to,
      authority,
      multiSigners,
    } = params

    const layout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      uint64('amount'),
      BufferLayout.u8('decimals'),
    ])

    return this.instructionEncode(layout, {
      instruction: 14, // MintTo2 instruction
      amount: u64LEBuffer(amount),
      decimals,
    }, [
      { write: token },
      { write: to },
      authority,
      multiSigners
    ]);

  }


}
