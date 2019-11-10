import {random} from "dyna-loops";

export interface IDynaRetryConfig<TResolve = void> {
	operation: () => Promise<TResolve>;
	maxRetries?: number | null;  // Default: 5, null for endless
	retryTimeoutBaseMs?: number;
	increasePercentFrom?: number;
	increasePercentTo?: number;
	retryTimeoutMaxMs?: number;
	delayAlgorithm?: (currentDelay: number, retryNo: number) => number;
	onRetry?: (retryNo: number, cancel: () => void) => void;
	onFail?: (error: any, retryNo: number, cancel: () => void) => void;
}

export class DynaRetry<TResolve = void> {
	private readonly _config: IDynaRetryConfig<TResolve> = {
		operation: () => Promise.resolve(null),
		maxRetries: 5,
		retryTimeoutBaseMs: 500,
		increasePercentFrom: 20,
		increasePercentTo: 60,
		retryTimeoutMaxMs: 1 * 60 * 1000, // one minute
	};
	private _retryNo: number = 0;
	private _currentDelay: number = 0;

	private _isWorking = false;
	private readonly _bufferedStarts: Array<{ resolve: <TResolve>(TResolve) => void, reject: (error: any) => void }> = [];

	constructor(config: IDynaRetryConfig<TResolve>) {
		this._config = {
			...this._config,
			...config,
		};
	}

	private _getDelay(): number {
		if (this._config.delayAlgorithm) {
			this._currentDelay = this._config.delayAlgorithm(this._currentDelay, this._retryNo);
		}
		else {
			this._currentDelay +=
				(this._currentDelay | this._config.retryTimeoutBaseMs)
				* (random(this._config.increasePercentFrom, this._config.increasePercentTo) / 100);
		}
		if (this._currentDelay > this._config.retryTimeoutMaxMs) this._currentDelay = this._config.retryTimeoutMaxMs;
		return this._currentDelay;
	}

	public start(): Promise<TResolve> {
		if (this._isWorking) return new Promise<TResolve>((resolve, reject) => this._bufferedStarts.push({resolve, reject}));
		this._isWorking = true;

		let cancel: boolean = false;
		const cancelIt = () => cancel = true;
		let lastError: any = null;

		return new Promise<TResolve>((resolve: (TResolve) => void, reject: (error: any) => void) => {
			const tryIt = () => {
				if (cancel) {
					reject(lastError);
					return;
				}
				this._retryNo++;
				this._config.onRetry && this._config.onRetry(this._retryNo, cancelIt);
				this._config.operation()
					.then(data => {
						this._isWorking = false;
						resolve(data);
						while (this._bufferedStarts.length) this._bufferedStarts.shift().resolve(data);
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
							while (this._bufferedStarts.length) this._bufferedStarts.shift().reject(error);
						}
					});
			};

			tryIt();
		});
	}
}

export const retry = <TResolve>(config: IDynaRetryConfig<TResolve>): Promise<TResolve> => {
	const retry: DynaRetry<TResolve> = new DynaRetry(config);
	return retry.start();
};
