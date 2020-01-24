import {IDynaRetryConfig, DynaRetry} from "./DynaRetry";

export interface IRetryReturn<TResolve> extends Promise<TResolve> {
  cancel: (errorMessage?: string) => void;
}

export const retry = <TResolve>(config: IDynaRetryConfig<TResolve>): IRetryReturn<TResolve> => {
  const retry: DynaRetry<TResolve> = new DynaRetry(config);
  const output:IRetryReturn<TResolve> = retry.start() as any;
  output.cancel = retry.cancel;
  return output;
};
