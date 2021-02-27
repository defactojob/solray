"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solana = exports.Deployer = exports.System = exports.BPFLoader = exports.BaseProgram = exports.ProgramAccount = exports.SPLToken = exports.Wallet = exports.PublicKey = exports.Account = void 0;
const web3_js_1 = require("@solana/web3.js");
var web3_js_2 = require("@solana/web3.js");
Object.defineProperty(exports, "Account", { enumerable: true, get: function () { return web3_js_2.Account; } });
Object.defineProperty(exports, "PublicKey", { enumerable: true, get: function () { return web3_js_2.PublicKey; } });
var Wallet_1 = require("./Wallet");
Object.defineProperty(exports, "Wallet", { enumerable: true, get: function () { return Wallet_1.Wallet; } });
var SPLToken_1 = require("./SPLToken");
Object.defineProperty(exports, "SPLToken", { enumerable: true, get: function () { return SPLToken_1.SPLToken; } });
var ProgramAccount_1 = require("./ProgramAccount");
Object.defineProperty(exports, "ProgramAccount", { enumerable: true, get: function () { return ProgramAccount_1.ProgramAccount; } });
var BaseProgram_1 = require("./BaseProgram");
Object.defineProperty(exports, "BaseProgram", { enumerable: true, get: function () { return BaseProgram_1.BaseProgram; } });
var BPFLoader_1 = require("./BPFLoader");
Object.defineProperty(exports, "BPFLoader", { enumerable: true, get: function () { return BPFLoader_1.BPFLoader; } });
var System_1 = require("./System");
Object.defineProperty(exports, "System", { enumerable: true, get: function () { return System_1.System; } });
var Deployer_1 = require("./Deployer");
Object.defineProperty(exports, "Deployer", { enumerable: true, get: function () { return Deployer_1.Deployer; } });
const defaultRPCHosts = {
    local: "http://localhost:8899",
    dev: "https://devnet.solana.com",
    devnet: "https://devnet.solana.com",
    main: "https://api.mainnet-beta.solana.com",
    mainnet: "https://api.mainnet-beta.solana.com",
};
var solana;
(function (solana) {
    function connect(networkName, opts = {}) {
        const commitment = opts.commitment || "singleGossip";
        const rpcHost = opts.rpcHost || defaultRPCHosts[networkName];
        if (!rpcHost) {
            throw new Error(`Cannot find RPC Host to connect to: ${networkName}`);
        }
        return new web3_js_1.Connection(rpcHost, commitment);
    }
    solana.connect = connect;
})(solana = exports.solana || (exports.solana = {}));
