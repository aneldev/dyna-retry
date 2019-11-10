export interface IDynaRetryConfig<TResolve = void> {
    operation: () => Promise<TResolve>;
    maxRetries?: number | null;
    retryTimeoutBaseMs?: number;
    increasePercentFrom?: number;
    increasePercentTo?: number;
    retryTimeoutMaxMs?: number;
    delayAlgorithm?: (currentDelay: number, retryNo: number) => number;
    onRetry?: (retryNo: number, cancel: () => void) => void;
    onFail?: (error: any, retryNo: number, cancel: () => void) => void;
}
export declare class DynaRetry<TResolve = void> {
    private readonly _config;
    private _retryNo;
    private _currentDelay;
    private _isWorking;
    private readonly _bufferedStarts;
    constructor(config: IDynaRetryConfig<TResolve>);
    private _getDelay();
    start(): Promise<TResolve>;
}
export declare const retry: <TResolve>(config: IDynaRetryConfig<TResolve>) => Promise<TResolve>;
