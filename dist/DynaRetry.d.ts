export interface IDynaRetryConfig<TResolve> {
    operation: () => Promise<TResolve>;
    data?: any;
    maxRetries?: number;
    retryTimeoutBaseMs?: number;
    increasePercentFrom?: number;
    increasePercentTo?: number;
    retryTimeoutMaxMs?: number;
    delayAlgorithm?: (currentDelay: number, retryNo: number) => number;
    onRetry?: (retryNo: number, cancel: () => void) => void;
    onFail?: (retryNo: number, cancel: () => void) => void;
}
export declare class DynaRetry<TResolve> {
    private config;
    private retryNo;
    private currentDelay;
    constructor(config: IDynaRetryConfig<TResolve>);
    private getDelay();
    start(): Promise<TResolve>;
}
export declare const retry: <TResolve>(config: IDynaRetryConfig<TResolve>) => Promise<TResolve>;
