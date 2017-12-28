import { IDynaRetryConfig } from "./DynaRetry";
export declare type TOnFail = (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => void;
export interface IDynaRetrySyncConfig {
    active?: boolean;
    onResolve?: (item: IDynaRetryConfig<any>) => void;
    onFail?: TOnFail;
    onEmpty?: () => void;
}
export declare class DynaRetrySync {
    private _config;
    private _items;
    private _isWorking;
    private _active;
    private _paused;
    constructor(config?: IDynaRetrySyncConfig);
    readonly isWorking: boolean;
    readonly count: number;
    add(retryItem: IDynaRetryConfig<any>): void;
    start(): void;
    stop(): void;
    processNext(): void;
}
