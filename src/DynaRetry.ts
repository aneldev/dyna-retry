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
		onRetry: () => undefined,
		onFail: () => undefined,
	};
	private _retryNo: number = 0;
	private _currentDelay: number = 0;

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

		let cancel: boolean = false;
		const cancelIt = () => cancel = true;
		let lastError: any = null;

		return new Promise((resolve: (r?: TResolve) => void, reject: (error: any) => void) => {
			const tryIt = () => {
				if (cancel) {
					reject(lastError);
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
}

export const retry = <TResolve>(config: IDynaRetryConfig<TResolve>): Promise<TResolve> => {
	const retry: DynaRetry<TResolve> = new DynaRetry(config);
	return retry.start();
};
