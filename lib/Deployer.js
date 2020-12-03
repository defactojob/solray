"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deployer = void 0;
const index_1 = require("./index");
const fs_1 = require("fs");
const { readFile, writeFile } = fs_1.promises;
class Deployer {
    constructor(records, filePath) {
        this.records = records;
        this.filePath = filePath;
    }
    static async open(filePath) {
        let records = {};
        try {
            // FIXME: probably should do some data verification here...
            const jsonData = await readFile(filePath, "utf8");
            records = JSON.parse(jsonData);
        }
        finally {
            return new Deployer(records, filePath);
        }
    }
    async ensure(key, action) {
        let account = this.account(key);
        if (account) {
            return account;
        }
        account = await action();
        if (account == null) {
            throw new Error("deployer action must return an account");
        }
        this.records[key] = {
            pubkey: account.publicKey.toBase58(),
            secret: Buffer.from(account.secretKey).toString("hex"),
        };
        await this.save();
        return account;
    }
    account(key) {
        const keypair = this.records[key];
        if (!keypair) {
            return null;
        }
        return new index_1.Account(Buffer.from(keypair.secret, "hex"));
    }
    async save() {
        const jsonData = JSON.stringify(this.records, null, 2);
        await writeFile(this.filePath, jsonData, "utf8");
    }
}
exports.Deployer = Deployer;
