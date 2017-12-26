import {random} from "dyna-loops";

export interface IDynaRetryConfig<TResolve> {
	operation: ()=>Promise<TResolve>;
	maxRetries?: number;
	retryTimeoutBaseMs?: number;
	increasePercentFrom?: number;
	increasePercentTo?: number;
	retryTimeoutMaxMs?: number;
	delayAlgorithm?: (currentDelay: number, retryNo_number) => number;
	onRetry?: (retryNo: number, cancel: () => void) => void;
	onFail?: (retryNo: number, cancel: () => void) => void;
}

export class DynaRetry<TResolve> {
	private config: IDynaRetryConfig<TResolve> = {
		operation: ()=>Promise.resolve(null),
		maxRetries: 5,
		retryTimeoutBaseMs: 500,
		increasePercentFrom: 20,
		increasePercentTo: 60,
		retryTimeoutMaxMs: 1 * 60 * 1000, // one minute
	};
	private retryNo: number = 0;
	private currentDelay: number = 0;

	constructor(config: IDynaRetryConfig<TResolve>) {
		this.config = {
			...this.config,
			...config,
		};
	}

	private getDelay(): number {
		if (this.config.delayAlgorithm) {
			this.currentDelay = this.config.delayAlgorithm(this.currentDelay, this.retryNo);
		}
		else {
			this.currentDelay +=
				(this.currentDelay | this.config.retryTimeoutBaseMs)
				* (random(this.config.increasePercentFrom, this.config.increasePercentTo) / 100);
		}
		if (this.currentDelay > this.config.retryTimeoutMaxMs) this.currentDelay = this.config.retryTimeoutMaxMs;
		return this.currentDelay;
	}

	public start(): Promise<TResolve> {
		let cancel: boolean = false;
		const cancelIt = () => cancel = true;
		let lastError: any = null;

		return new Promise<TResolve>((resolve: (TResolve) => void, reject: (error: any) => void) => {
			const tryIt = () => {
				if (cancel) {
					reject(lastError);
					return;
				}
				this.retryNo++;
				this.config.onRetry && this.config.onRetry(this.retryNo, cancelIt);
				this.config.operation()
					.then(resolve)
					.catch((error: any) => {
						lastError = error;
						this.config.onFail && this.config.onFail(this.retryNo, cancelIt);
						if (this.config.maxRetries === null || this.retryNo < this.config.maxRetries) {
							setTimeout(tryIt, this.getDelay());
						}
						else {
							reject(error)
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
