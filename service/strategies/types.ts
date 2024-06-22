import { sleep } from "../lib/utils";

export type Metadata = {
    [key: string]: any
}

export type Credential = {
    slug: string,
    metadata: Metadata,
}

export type Collection = {
    slug: string,
    metadata: Metadata,
    credentials: Credential[]
}

export type TransactionMinInfo = {
    hash: string, network: number, timestamp: number, value?: number
}

export type CalculateResult = {
    value: number,
    txs: TransactionMinInfo[],
    assets?: any[]
}

export enum MODE {
    DISABLE_CACHE = 0,
    ENABLE_TRANSACTION = 1,
    ENABLE_ERC20_TRANSFER = 2,
    ENABLE_NFT_TRANSFER = 4,
    ENABLE_INTERNAL_TRANSACTION = 8,
}

// export interface ICredentialCalculator {
//     process(owner: string, network?: number, start?, end?): Promise<CalculateResult>;
//     getMode(): MODE;
//     getNetworks(): number[] | null;
// }

export abstract class AbstractCredentialCalculator {
    cacheFinished: boolean = false;

    protected constructor() {

    }

    // static getInstance(): AbstractCredentialCalculator {
    //     return new (this as AerodromeSwapTimeCalculator)();
    // }

    async prepare(owner: string, start?, end?) {
        this.cacheFinished = true
    }   

    async isReady() {
        while (!this.cacheFinished) {
            await sleep(100)
        }
        return this
    }

    /**
     * 
     * @param owner 
     * @param network 
     * @param start 
     * @param end 
     * @returns 
     */
    async calculate(owner: string, network?: number, start?: number, end?: number): Promise<CalculateResult> {
        await this.prepare(owner, start, end);
        return this.process(owner, network, start, end)
    }

    abstract process(owner: string, network?: number, start?, end?): Promise<CalculateResult>;
    abstract getMode(): MODE;
    abstract getNetworks(): number[] | null;
}