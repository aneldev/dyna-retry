import {random} from "dyna-loops";

export interface IDynaRetryConfig<TResolve = void> {
  operation: () => Promise<TResolve>;
  maxRetries?: number | null;  // Default: 5, null for endless
  retryTimeoutBaseMs?: number;
  increasePercentFrom?: number;
  increasePercentTo?: number;
  retryTimeoutMaxMs?: number;
  delayAlgorithm?: (currentDelay: number, retryNo: number) => number;
  onCancel?: () => Promise<void>;
  onRetry?: (retryNo: number, cancel: (errorMessage?: string) => void) => void;
  onFail?: (error: any, retryNo: number, cancel: (errorMessage?: string) => void) => void;
}

type TRequireAll<T> = {
	[P in keyof T]-?: T[P];
};

export class DynaRetry<TResolve = void> {
  private readonly _config: TRequireAll<IDynaRetryConfig<TResolve>> = {
    maxRetries: 5,
    operation: () => new Promise<TResolve>(r => r()),
    retryTimeoutBaseMs: 500,
    increasePercentFrom: 20,
    increasePercentTo: 60,
    retryTimeoutMaxMs: 60 * 1000 * 1, // minutes
    delayAlgorithm: (currentDelay, retryNo) => {
      if (currentDelay === this._config.retryTimeoutMaxMs) return currentDelay;
      let output =
        currentDelay +
        (
          (currentDelay | this._config.retryTimeoutBaseMs)
          * (random(this._config.increasePercentFrom, this._config.increasePercentTo) / 100)
        );
      if (output > this._config.retryTimeoutMaxMs) output = this._config.retryTimeoutMaxMs;
      return output;
    },
    onCancel: async () => undefined,
    onRetry: () => undefined,
    onFail: () => undefined,
  };
  private _retryNo: number = 0;
  private _currentDelay: number = 0;
  private _canceled: boolean = false;
  private _canceledErrorMessage: string = '';
  private _isWorking = false;
  private readonly _bufferedStarts: Array<{ resolve: (r?: TResolve) => void, reject: (error: any) => void }> = [];

  constructor(readonly config: IDynaRetryConfig<TResolve>) {
    this._config = {
      ...this._config,
      ...config,
    };
  }

  private _getDelay(): number {
    return this._currentDelay = this._config.delayAlgorithm(this._currentDelay, this._retryNo);
  }

  public start(): Promise<TResolve> {
    if (this._isWorking) return new Promise<TResolve>((resolve, reject) => this._bufferedStarts.push({resolve, reject}));
    this._isWorking = true;

    this._canceled = false;
    this._canceledErrorMessage = '';
    let cancel: boolean = false;
    const cancelIt = (cancelErrorMessage?: string) => {
      this._canceledErrorMessage = cancelErrorMessage || 'Canceled';
      cancel = true;
    };

    let lastError: any = null;

    return new Promise((resolve: (r?: TResolve) => void, reject: (error: any) => void) => {
      const tryIt = async () => {
        if (this._canceled || cancel) {
          await this._config.onCancel();
          reject({
            message: this._canceledErrorMessage,
            data: {lastError}
          });
          return;
        }
        this._retryNo++;
        this._config.onRetry && this._config.onRetry(this._retryNo, cancelIt);
        this._config.operation()
          .then((r) => {
            this._isWorking = false;
            resolve(r);
            while (this._bufferedStarts.length) {
              const bufferedStart = this._bufferedStarts.shift();
              if (bufferedStart) bufferedStart.resolve(r);
            }
          })
          .catch((error: any) => {
            lastError = error;
            this._config.onFail && this._config.onFail(error, this._retryNo, cancelIt);
            if (this._config.maxRetries === null || this._retryNo < this._config.maxRetries) {
              setTimeout(tryIt, this._getDelay());
            }
            else {
              this._isWorking = false;
              reject(error);
              while (this._bufferedStarts.length) {
                const bufferedStart = this._bufferedStarts.shift();
                if (bufferedStart) bufferedStart.reject(error);
              }
            }
          });
      };

      tryIt();
    });
  }

  public cancel(errorMessage?: string): void {
    if (!this._isWorking) return;
    this._canceled = true;
    this._canceledErrorMessage = errorMessage || 'Canceled';
  }
}

