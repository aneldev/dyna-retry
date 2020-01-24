export interface IDynaRetryConfig<TResolve = void> {
    operation: () => Promise<TResolve>;
    maxRetries?: number | null;
    retryTimeoutBaseMs?: number;
    increasePercentFrom?: number;
    increasePercentTo?: number;
    retryTimeoutMaxMs?: number;
    delayAlgorithm?: (currentDelay: number, retryNo: number) => number;
    onCancel?: () => Promise<void>;
    onRetry?: (retryNo: number, cancel: (errorMessage?: string) => void) => void;
    onFail?: (error: any, retryNo: number, cancel: (errorMessage?: string) => void) => void;
}
export declare class DynaRetry<TResolve = void> {
    readonly config: IDynaRetryConfig<TResolve>;
    private readonly _config;
    private _retryNo;
    private _currentDelay;
    private _canceled;
    private _canceledErrorMessage;
    private _isWorking;
    private readonly _bufferedStarts;
    constructor(config: IDynaRetryConfig<TResolve>);
    private _getDelay;
    start(): Promise<TResolve>;
    cancel(errorMessage?: string): void;
}
