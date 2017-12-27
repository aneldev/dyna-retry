import { IDynaRetryConfig } from "./DynaRetry";
export interface IDynaRetrySyncConfig {
    onResolve?: (item: IDynaRetryConfig<any>) => void;
    onFail?: (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => void;
    onEmpty?: () => void;
}
export declare class DynaRetrySync {
    private config;
    private items;
    private _isWorking;
    private _paused;
    constructor(config?: IDynaRetrySyncConfig);
    readonly isWorking: boolean;
    readonly count: number;
    add(retryItem: IDynaRetryConfig<any>): void;
    start(): void;
}
