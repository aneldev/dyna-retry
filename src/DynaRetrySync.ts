import {IDynaRetryConfig, retry} from "./DynaRetry";

export type TOnFail = (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => void;

export interface IDynaRetrySyncConfig {
	onResolve?: (item: IDynaRetryConfig<any>) => void;
	onFail?: TOnFail;
	onEmpty?: () => void;
}

export class DynaRetrySync {
	private config: IDynaRetrySyncConfig;
	private items: IDynaRetryConfig<any>[] = [];
	private _isWorking: boolean = false;
	private _paused: boolean = false;   // for internal use only... used on onFail callback when we are waiting the object user to react with "retry", "skip" or "stop",

	constructor(config: IDynaRetrySyncConfig = {}) {
		this.config = {
			...config,
		};

		if (!this.config.onFail) {
			console.error('DynaRetrySync requires to implement the onFail function. See at http://www.github.com/aneldev/dyna-retry')
		}
	}

	public get isWorking(): boolean {
		return this.isWorking;
	}

	public get count(): number {
		return this.items.length;
	}

	public add(retryItem: IDynaRetryConfig<any>): void {
		this.items.push(retryItem);
		this.start();
	}

	public start(): void {
		if (this._paused) return;
		if (this._isWorking) return;

		if (!this.items.length) {
			this.config.onEmpty && this.config.onEmpty();
			return;
		}

		this._isWorking = true;

		retry(this.items[0])
			.then(() => {
				this.config.onResolve && this.config.onResolve(this.items[0]);
				this.items.shift();
				this._isWorking = false;
				this.start();
			})
			.catch((error: any) => {
				this._isWorking = false;
				this._paused = true;
				this.config.onFail && this.config.onFail(
					this.items[0],
					error,
					() => { // retry
						this._paused = false;
						this.start();
					},
					() => { // skip
						this._paused = false;
						this.items.shift();
						this.start();
					},
					() => { // stop
						this._paused = false;
					},
				);
			});
	}

}
