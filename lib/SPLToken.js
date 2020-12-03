"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPLToken = exports.NATIVE_MINT = exports.AccountLayout = exports.MintLayout = void 0;
const web3_js_1 = require("@solana/web3.js");
const System_1 = require("./System");
const _1 = require(".");
const BaseProgram_1 = require("./BaseProgram");
const buffer_layout_1 = __importDefault(require("buffer-layout"));
const encoding_1 = require("./util/encoding");
exports.MintLayout = buffer_layout_1.default.struct([
    buffer_layout_1.default.u32('mintAuthorityOption'),
    encoding_1.publicKey('mintAuthority'),
    encoding_1.uint64('supply'),
    buffer_layout_1.default.u8('decimals'),
    buffer_layout_1.default.u8('isInitialized'),
    buffer_layout_1.default.u32('freezeAuthorityOption'),
    encoding_1.publicKey('freezeAuthority'),
]);
exports.AccountLayout = buffer_layout_1.default.struct([
    encoding_1.publicKey('mint'),
    encoding_1.publicKey('owner'),
    encoding_1.uint64('amount'),
    buffer_layout_1.default.u32('delegateOption'),
    encoding_1.publicKey('delegate'),
    buffer_layout_1.default.u8('state'),
    buffer_layout_1.default.u32('isNativeOption'),
    encoding_1.uint64('isNative'),
    encoding_1.uint64('delegatedAmount'),
    buffer_layout_1.default.u32('closeAuthorityOption'),
    encoding_1.publicKey('closeAuthority'),
]);
const AuthorityTypeCodes = {
    MintTokens: 0,
    FreezeAccount: 1,
    AccountOwner: 2,
    CloseAccount: 3,
};
const MultisigLayout = buffer_layout_1.default.struct([
    buffer_layout_1.default.u8('m'),
    buffer_layout_1.default.u8('n'),
    buffer_layout_1.default.u8('is_initialized'),
    encoding_1.publicKey('signer1'),
    encoding_1.publicKey('signer2'),
    encoding_1.publicKey('signer3'),
    encoding_1.publicKey('signer4'),
    encoding_1.publicKey('signer5'),
    encoding_1.publicKey('signer6'),
    encoding_1.publicKey('signer7'),
    encoding_1.publicKey('signer8'),
    encoding_1.publicKey('signer9'),
    encoding_1.publicKey('signer10'),
    encoding_1.publicKey('signer11'),
]);
// The address of the special mint for wrapped native token.
exports.NATIVE_MINT = new _1.PublicKey('So11111111111111111111111111111111111111112');
class SPLToken extends BaseProgram_1.BaseProgram {
    constructor(wallet, programID = SPLToken.programID) {
        super(wallet, programID);
        this.sys = new System_1.System(this.wallet);
    }
    /**
     * Retrieve mint information
     *
     * @param token Public key of the token
     */
    async mintInfo(token) {
        const info = await this.wallet.conn.getAccountInfo(token);
        if (info === null) {
            throw new Error('Failed to find mint account');
        }
        if (!info.owner.equals(this.programID)) {
            throw new Error(`Invalid mint owner: ${JSON.stringify(info.owner)}`);
        }
        if (info.data.length != exports.MintLayout.span) {
            throw new Error(`Invalid mint size`);
        }
        const data = Buffer.from(info.data);
        const mintInfo = exports.MintLayout.decode(data);
        if (mintInfo.mintAuthorityOption === 0) {
            mintInfo.mintAuthority = null;
        }
        else {
            mintInfo.mintAuthority = new _1.PublicKey(mintInfo.mintAuthority);
        }
        mintInfo.supply = mintInfo.supply.readBigUInt64LE();
        mintInfo.isInitialized = mintInfo.isInitialized != 0;
        if (mintInfo.freezeAuthorityOption === 0) {
            mintInfo.freezeAuthority = null;
        }
        else {
            mintInfo.freezeAuthority = new _1.PublicKey(mintInfo.freezeAuthority);
        }
        return mintInfo;
    }
    /**
     * Retrieve account information
     *
     * @param account Public key of the account
     */
    async accountInfo(account) {
        const info = await this.conn.getAccountInfo(account);
        if (info === null) {
            throw new Error('Failed to find account');
        }
        if (!info.owner.equals(this.programID)) {
            throw new Error(`Invalid account owner`);
        }
        if (info.data.length != exports.AccountLayout.span) {
            throw new Error(`Invalid account size`);
        }
        const data = Buffer.from(info.data);
        const accountInfo = exports.AccountLayout.decode(data);
        accountInfo.mint = new _1.PublicKey(accountInfo.mint);
        accountInfo.owner = new _1.PublicKey(accountInfo.owner);
        accountInfo.amount = encoding_1.u64FromBuffer(accountInfo.amount);
        if (accountInfo.delegateOption === 0) {
            accountInfo.delegate = null;
            accountInfo.delegatedAmount = BigInt(0);
        }
        else {
            accountInfo.delegate = new _1.PublicKey(accountInfo.delegate);
            accountInfo.delegatedAmount = encoding_1.u64FromBuffer(accountInfo.delegatedAmount);
        }
        accountInfo.isInitialized = accountInfo.state !== 0;
        accountInfo.isFrozen = accountInfo.state === 2;
        if (accountInfo.isNativeOption === 1) {
            accountInfo.rentExemptReserve = encoding_1.u64FromBuffer(accountInfo.isNative);
            accountInfo.isNative = true;
        }
        else {
            accountInfo.rentExemptReserve = null;
            accountInfo.isNative = false;
        }
        if (accountInfo.closeAuthorityOption === 0) {
            accountInfo.closeAuthority = null;
        }
        else {
            accountInfo.closeAuthority = new _1.PublicKey(accountInfo.closeAuthority);
        }
        return accountInfo;
    }
    /**
     * Retrieve Multisig information
     *
     * @param multisig Public key of the account
     */
    async multisigInfo(multisig) {
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
        multisigInfo.signer1 = new _1.PublicKey(multisigInfo.signer1);
        multisigInfo.signer2 = new _1.PublicKey(multisigInfo.signer2);
        multisigInfo.signer3 = new _1.PublicKey(multisigInfo.signer3);
        multisigInfo.signer4 = new _1.PublicKey(multisigInfo.signer4);
        multisigInfo.signer5 = new _1.PublicKey(multisigInfo.signer5);
        multisigInfo.signer6 = new _1.PublicKey(multisigInfo.signer6);
        multisigInfo.signer7 = new _1.PublicKey(multisigInfo.signer7);
        multisigInfo.signer8 = new _1.PublicKey(multisigInfo.signer8);
        multisigInfo.signer9 = new _1.PublicKey(multisigInfo.signer9);
        multisigInfo.signer10 = new _1.PublicKey(multisigInfo.signer10);
        multisigInfo.signer11 = new _1.PublicKey(multisigInfo.signer11);
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
    async initializeMint(params) {
        const account = params.account || new _1.Account();
        await this.sendTx([
            await this.sys.createRentFreeAccountInstruction({
                newPubicKey: account.publicKey,
                programID: this.programID,
                space: exports.MintLayout.span
            }),
            this.initMintInstruction({
                token: account.publicKey,
                ...params,
            })
        ], [this.account, account]);
        return account;
    }
    initMintInstruction(params) {
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            buffer_layout_1.default.u8('decimals'),
            encoding_1.publicKey('mintAuthority'),
            buffer_layout_1.default.u8('option'),
            encoding_1.publicKey('freezeAuthority'),
        ]);
        const { token, decimals, mintAuthority, freezeAuthority } = params;
        return this.instructionEncode(layout, {
            instruction: 0,
            decimals,
            mintAuthority: mintAuthority.toBuffer(),
            option: !freezeAuthority ? 0 : 1,
            freezeAuthority: (freezeAuthority || new _1.PublicKey(0)).toBuffer(),
        }, [
            { write: token },
            web3_js_1.SYSVAR_RENT_PUBKEY,
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
    async initializeAccount(params) {
        const account = params.account || new _1.Account();
        await this.sendTx([
            await this.sys.createRentFreeAccountInstruction({
                newPubicKey: account.publicKey,
                programID: this.programID,
                space: exports.AccountLayout.span
            }),
            this.initAccountInstruction({
                account: account.publicKey,
                token: params.token,
                owner: params.owner,
            })
        ], [this.account, account]);
        return account;
    }
    initAccountInstruction(params) {
        const layout = buffer_layout_1.default.struct([buffer_layout_1.default.u8('instruction')]);
        return this.instructionEncode(layout, { instruction: 1 }, [
            { write: params.account },
            params.token,
            params.owner,
            web3_js_1.SYSVAR_RENT_PUBKEY,
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
    async initializeWrappedNativeAccount(params) {
        const account = params.account || new _1.Account();
        await this.sendTx([
            await this.sys.createRentFreeAccountInstruction({
                newPubicKey: account.publicKey,
                programID: this.programID,
                space: exports.AccountLayout.span
            }),
            this.sys.createTransferInstruction({
                to: account.publicKey,
                amount: params.amount,
            }),
            this.initAccountInstruction({
                account: account.publicKey,
                token: exports.NATIVE_MINT,
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
    async mintTo(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : (multiSigners || []);
        await this.sendTx([this.mintToInstruction(params)], [this.account, ...signers]);
    }
    mintToInstruction(params) {
        const { token, amount, to, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            encoding_1.uint64('amount'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 7,
            amount: encoding_1.u64LEBuffer(amount),
        }, [
            { write: token },
            { write: to },
            authority,
            multiSigners || [],
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
    async approve(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.approveInstruction(params)], [this.account, ...signers]);
    }
    approveInstruction(params) {
        const { amount, account, delegate, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            encoding_1.uint64('amount'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 4,
            amount: encoding_1.u64LEBuffer(amount),
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
    async revoke(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.revokeInstruction(params)], [this.account, ...signers]);
    }
    revokeInstruction(params) {
        const { account, authority, multiSigners } = params;
        const layout = buffer_layout_1.default.struct([buffer_layout_1.default.u8('instruction')]);
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
    async burn(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.burnInstruction(params)], [this.account, ...signers]);
    }
    burnInstruction(params) {
        const { token, from, amount, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            encoding_1.uint64('amount'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 8,
            amount: encoding_1.u64LEBuffer(amount),
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
    async transfer(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.transferInstruction(params)], [this.account, ...signers]);
    }
    transferInstruction(params) {
        const { from, to, amount, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            encoding_1.uint64('amount'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 3,
            amount: encoding_1.u64LEBuffer(amount),
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
    async setAuthority(params) {
        const { currentAuthority, multiSigners } = params;
        const signers = currentAuthority.constructor == _1.Account ? [currentAuthority] : multiSigners;
        await this.sendTx([this.setAuthorityInstruction(params)], [this.account, ...signers]);
    }
    setAuthorityInstruction(params) {
        const { account, newAuthority, authorityType, currentAuthority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            buffer_layout_1.default.u8('authorityType'),
            buffer_layout_1.default.u8('option'),
            encoding_1.publicKey('newAuthority'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 6,
            authorityType: AuthorityTypeCodes[authorityType],
            option: newAuthority === null ? 0 : 1,
            newAuthority: (newAuthority || new _1.PublicKey('')).toBuffer(),
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
    async closeAccount(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.closeAccountInstruction(params)], [this.account, ...signers]);
    }
    closeAccountInstruction(params) {
        const { account, dest, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 9,
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
    async freezeAccount(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.freezeAccountInstruction(params)], [this.account, ...signers]);
    }
    freezeAccountInstruction(params) {
        const { token, account, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 10,
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
    async thawAccount(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.thawAccountInstruction(params)], [this.account, ...signers]);
    }
    thawAccountInstruction(params) {
        const { token, account, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 11,
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
    async transfer2(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.transfer2Instruction(params)], [this.account, ...signers]);
    }
    transfer2Instruction(params) {
        const { from, to, token, amount, decimals, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            encoding_1.uint64('amount'),
            buffer_layout_1.default.u8('decimals'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 12,
            amount: encoding_1.u64LEBuffer(amount),
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
    async approve2(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.approve2Instruction(params)], [this.account, ...signers]);
    }
    approve2Instruction(params) {
        const { token, amount, account, decimals, delegate, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            encoding_1.uint64('amount'),
            buffer_layout_1.default.u8('decimals'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 13,
            amount: encoding_1.u64LEBuffer(amount),
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
    async mintTo2(params) {
        const { authority, multiSigners } = params;
        const signers = authority.constructor == _1.Account ? [authority] : multiSigners;
        await this.sendTx([this.mintTo2Instruction(params)], [this.account, ...signers]);
    }
    mintTo2Instruction(params) {
        const { token, amount, decimals, to, authority, multiSigners, } = params;
        const layout = buffer_layout_1.default.struct([
            buffer_layout_1.default.u8('instruction'),
            encoding_1.uint64('amount'),
            buffer_layout_1.default.u8('decimals'),
        ]);
        return this.instructionEncode(layout, {
            instruction: 14,
            amount: encoding_1.u64LEBuffer(amount),
            decimals,
        }, [
            { write: token },
            { write: to },
            authority,
            multiSigners
        ]);
    }
}
exports.SPLToken = SPLToken;
SPLToken.programID = new _1.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
