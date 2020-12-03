import { Wallet } from './Wallet';
import { Account, PublicKey } from '.';
import { BaseProgram } from './BaseProgram';
import BufferLayout from 'buffer-layout';
export declare const MintLayout: typeof BufferLayout.Structure;
export declare const AccountLayout: typeof BufferLayout.Structure;
export interface InitMintParams {
    freezeAuthority?: PublicKey;
    mintAuthority: PublicKey;
    decimals: number;
    account?: Account;
}
export interface InitMintInstructionParams extends InitMintParams {
    token: PublicKey;
}
export interface InitAccountParams {
    token: PublicKey;
    owner: PublicKey;
    account?: Account;
}
export interface InitAccountInstructionParams {
    account: PublicKey;
    token: PublicKey;
    owner: PublicKey;
}
export interface InitWrappedNativeAccountParams {
    amount: number;
    owner: PublicKey;
    account?: Account;
}
export interface MintToParams {
    token: PublicKey;
    to: PublicKey;
    amount: bigint;
    authority: Account | PublicKey;
    multiSigners?: Account[];
}
export interface ApproveParams {
    account: PublicKey;
    delegate: PublicKey;
    amount: bigint;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
export interface Approve2Params {
    token: PublicKey;
    account: PublicKey;
    delegate: PublicKey;
    amount: bigint;
    decimals: number;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
export interface RevokeParams {
    account: PublicKey;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
export interface BurnParams {
    token: PublicKey;
    from: PublicKey;
    amount: bigint;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
export interface TransferParams {
    from: PublicKey;
    to: PublicKey;
    amount: bigint;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
export interface Transfer2Params {
    from: PublicKey;
    to: PublicKey;
    token: PublicKey;
    amount: bigint;
    decimals: number;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
declare type AuthorityType = 'MintTokens' | 'FreezeAccount' | 'AccountOwner' | 'CloseAccount';
export interface SetAuthorityParams {
    account: PublicKey;
    newAuthority: PublicKey | null;
    authorityType: AuthorityType;
    currentAuthority: Account | PublicKey;
    multiSigners: Account[];
}
export interface CloseAccountParams {
    account: PublicKey;
    dest: PublicKey;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
export interface FreezeAccountParams {
    token: PublicKey;
    account: PublicKey;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
export interface ThawAccountParams {
    token: PublicKey;
    account: PublicKey;
    authority: Account | PublicKey;
    multiSigners: Account[];
}
export interface MintTo2Params {
    token: PublicKey;
    to: PublicKey;
    amount: bigint;
    decimals: number;
    authority: Account | PublicKey;
    multiSigners: Account[];
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
export declare type MintInfo = {
    mintAuthority: null | PublicKey;
    supply: bigint;
    decimals: number;
    isInitialized: boolean;
    freezeAuthority: null | PublicKey;
};
export declare type AccountInfo = {
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
/**
 * Information about an multisig
 */
declare type MultisigInfo = {
    /**
     * The number of signers required
     */
    m: number;
    /**
     * Number of possible signers, corresponds to the
     * number of `signers` that are valid.
     */
    n: number;
    /**
     * Is this mint initialized
     */
    initialized: boolean;
    /**
     * The signers
     */
    signer1: PublicKey;
    signer2: PublicKey;
    signer3: PublicKey;
    signer4: PublicKey;
    signer5: PublicKey;
    signer6: PublicKey;
    signer7: PublicKey;
    signer8: PublicKey;
    signer9: PublicKey;
    signer10: PublicKey;
    signer11: PublicKey;
};
export declare const NATIVE_MINT: PublicKey;
export declare class SPLToken extends BaseProgram {
    static programID: PublicKey;
    private sys;
    constructor(wallet: Wallet, programID?: PublicKey);
    /**
     * Retrieve mint information
     *
     * @param token Public key of the token
     */
    mintInfo(token: PublicKey): Promise<MintInfo>;
    /**
     * Retrieve account information
     *
     * @param account Public key of the account
     */
    accountInfo(account: PublicKey): Promise<AccountInfo>;
    /**
     * Retrieve Multisig information
     *
     * @param multisig Public key of the account
     */
    multisigInfo(multisig: PublicKey): Promise<MultisigInfo>;
    /**
     * Creates a new token with zero supply
     *
     * @param mintAuthority Account or multisig that will control minting
     * @param freezeAuthority Optional account or multisig that can freeze token accounts
     * @param decimals Location of the decimal place
     * @return Token object for the newly minted token
     */
    initializeMint(params: InitMintParams): Promise<Account>;
    private initMintInstruction;
    /**
     * Creates an account to hold token balance
     *
     * This account may then be used as a `transfer()` or `approve()` destination
     *
     * @param owner User account that will own the new account
     * @return Public key of the new empty account
     */
    initializeAccount(params: InitAccountParams): Promise<Account>;
    private initAccountInstruction;
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
    initializeWrappedNativeAccount(params: InitWrappedNativeAccountParams): Promise<Account>;
    /**
     * Mint new tokens
     *
     * @param token To mint token
     * @param amount Amount to mint
     * @param to Public key of the account to mint to
     * @param authority Minting authority
     * @param multiSigners Signing accounts if `authority` is a multiSig
     */
    mintTo(params: MintToParams): Promise<void>;
    private mintToInstruction;
    /**
     * Construct an Approve instruction
     *
     * @param amount Maximum number of tokens the delegate may transfer
     * @param account Public key of the account
     * @param delegate Account authorized to perform a transfer of tokens from the source account
     * @param authority Owner of the source account
     * @param multiSigners Signing accounts if `owner` is a multiSig
     */
    approve(params: ApproveParams): Promise<void>;
    private approveInstruction;
    /**
     * Remove approval for the transfer of any remaining tokens
     *
     * @param account Public key of the account
     * @param authority Owner of the source account
     * @param multiSigners Signing accounts if `owner` is a multiSig
     */
    revoke(params: RevokeParams): Promise<void>;
    private revokeInstruction;
    /**
     * Burn tokens
     *
     * @param token The token pubkey
     * @param from  Burn from account
     * @param amount Amount to burn
     * @param authority Account owner
     * @param multiSigners Signing accounts if `owner` is a multiSig
     */
    burn(params: BurnParams): Promise<void>;
    private burnInstruction;
    /**
     * Transfer tokens to another account
     *
     * @param from Source account
     * @param to Destination account
     * @param amount Number of tokens to transfer
     * @param authority Owner of the source account
     * @param multiSigners Signing accounts if `owner` is a multiSig
     */
    transfer(params: TransferParams): Promise<void>;
    private transferInstruction;
    /**
     * Assign a new authority to the account
     *
     * @param account Public key of the account
     * @param newAuthority New authority of the account
     * @param authorityType Type of authority to set
     * @param currentAuthority Current authority of the account
     * @param multiSigners Signing accounts if `currentAuthority` is a multiSig
     */
    setAuthority(params: SetAuthorityParams): Promise<void>;
    private setAuthorityInstruction;
    /**
     * Close account
     *
     * @param account Account to close
     * @param dest Account to receive the remaining balance of the closed account
     * @param authority Authority which is allowed to close the account
     * @param multiSigners Signing accounts if `authority` is a multiSig
     */
    closeAccount(params: CloseAccountParams): Promise<void>;
    private closeAccountInstruction;
    /**
     * Freeze account
     *
     * @param token The token public key
     * @param account Account to freeze
     * @param authority The mint freeze authority
     * @param multiSigners Signing accounts if `authority` is a multiSig
     */
    freezeAccount(params: FreezeAccountParams): Promise<void>;
    private freezeAccountInstruction;
    /**
     * Thaw account
     *
     * @param account Account to thaw
     * @param authority The mint freeze authority
     * @param multiSigners Signing accounts if `authority` is a multiSig
     */
    thawAccount(params: ThawAccountParams): Promise<void>;
    private thawAccountInstruction;
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
    transfer2(params: Transfer2Params): Promise<void>;
    private transfer2Instruction;
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
    approve2(params: Approve2Params): Promise<void>;
    private approve2Instruction;
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
    mintTo2(params: MintTo2Params): Promise<void>;
    private mintTo2Instruction;
}
export {};
