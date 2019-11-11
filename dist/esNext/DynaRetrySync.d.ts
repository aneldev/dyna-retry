import { IDynaRetryConfig } from "./DynaRetry";
export declare type TOnFail = (item: IDynaRetryConfig, error: any, retry: () => void, skip: () => void, stop: () => void) => void;
export interface IDynaRetrySyncConfig {
    active?: boolean;
    onResolve?: (item: IDynaRetryConfig) => void;
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
    get isWorking(): boolean;
    get count(): number;
    add(retryItem: IDynaRetryConfig): void;
    start(): void;
    stop(): void;
    get active(): boolean;
    private processNext;
}
