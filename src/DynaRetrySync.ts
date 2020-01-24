import {IDynaRetryConfig} from "./DynaRetry";
import {retry} from "./retry";

export type TOnFail = (item: IDynaRetryConfig, error: any, retry: () => void, skip: () => void, stop: () => void) => void;

export interface IDynaRetrySyncConfig {
	active?: boolean;
	onResolve?: (item: IDynaRetryConfig) => void;
	onFail?: TOnFail;
	onEmpty?: () => void;
}

type Required<T> = {
	[P in keyof T]-?: T[P];
};

export class DynaRetrySync {
	private _config: Required<IDynaRetrySyncConfig>;
	private _items: IDynaRetryConfig[] = [];
	private _isWorking: boolean = false;
	private _active: boolean = false;   // object user's start and stop handle
	private _paused: boolean = false;   // for internal use only... used on onFail callback when we are waiting the object user to react with "retry", "skip" or "stop",

	constructor(config: IDynaRetrySyncConfig = {}) {
		this._config = {
			active: true,
			...config,
		} as any;

		this._active = this._config.active;

		if (!this._config.onFail) {
			console.error('DynaRetrySync requires to implement the onFail function. See at https://github.com/aneldev/dyna-retry#onfail-item-idynaretryconfig-error-any-retry---void-skip---void-stop---void')
		}
	}

	public get isWorking(): boolean {
		return this.isWorking;
	}

	public get count(): number {
		return this._items.length;
	}

	public add(retryItem: IDynaRetryConfig): void {
		this._items.push(retryItem);
		this.processNext();
	}

	public start(): void {
		this._active = true;
		this.processNext();
	}

	public stop(): void {
		this._active = false;
	}

	public get active(): boolean {
		return this._active;
	}

	private processNext(): void {
		if (!this._active) return;
		if (this._paused) return;
		if (this._isWorking) return;

		if (!this._items.length) {
			this._config.onEmpty && this._config.onEmpty();
			return;
		}

		this._isWorking = true;

		retry(this._items[0])
			.then(() => {
				this._config.onResolve && this._config.onResolve(this._items[0]);
				this._items.shift();
				this._isWorking = false;
				this.processNext();
			})
			.catch((error: any) => {
				this._isWorking = false;
				this._paused = true;
				this._config.onFail && this._config.onFail(
					this._items[0],
					error,
					() => { // retry
						this._paused = false;
						this.processNext();
					},
					() => { // skip
						this._paused = false;
						this._items.shift();
						this.processNext();
					},
					() => { // stop
						this._paused = false;
					},
				);
			});
	}

}
