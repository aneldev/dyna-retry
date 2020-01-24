import { IDynaRetryConfig } from "./DynaRetry";
export interface IRetryReturn<TResolve> extends Promise<TResolve> {
    cancel: (errorMessage?: string) => void;
}
export declare const retry: <TResolve>(config: IDynaRetryConfig<TResolve>) => IRetryReturn<TResolve>;
