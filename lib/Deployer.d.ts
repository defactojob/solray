import { Account } from "./index";
interface AccountRecords {
    [key: string]: {
        secret: string;
        pubkey: string;
    };
}
export declare class Deployer {
    private records;
    filePath: string;
    static open(filePath: string): Promise<Deployer>;
    constructor(records: AccountRecords, filePath: string);
    ensure(key: string, action: () => Promise<Account>): Promise<Account>;
    account(key: string): Account | null;
    private save;
}
export {};
