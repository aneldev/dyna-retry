import {retry} from "../../src";
import * as fetch from "isomorphic-fetch";

declare let jasmine: any, describe: any, expect: any, it: any;

// help: https://facebook.github.io/jest/docs/expect.html

describe('Dyna Retry - retry 5 and succeed', () => {
	let retryStarted: Date;
	let retryEnded: Date;
	let retries: number = 0;
	let retried: number = 0;
	let failed: number = 0;

	interface IData {
		name: string
	}

	interface IError {
		message: string
	}

	let operation = (): Promise<IData> => {
		return new Promise((resolve: (data: IData) => void, reject: (error: IError) => void) => {
			retries++;
			if (retries < 5) reject({message: `Something went wrong`}); else resolve({name: 'John'});
		});
	};

	it('should retry 5 times in certain time', (done: Function) => {
		retryStarted=new Date();
		retry({
			operation: operation,
			maxRetries: 5,
			onRetry: () => retried++,
			onFail: () => failed++,
		})
			.then((data: IData) => {
				retryEnded=new Date();
				expect(data.name).toBe('John');
				expect(Number(retryEnded) - Number(retryStarted) < 5000).toBe(true);
				done();
			})
			.catch((error: IError) => {
				expect(false).toBe(true);
				done();
			});
	});

	it('should use the onXxxxx callbacks', () => {
		expect(retried).toBe(retries);
		expect(failed).toBe(retries - 1);
	});
});

describe('Dyna Retry - retry 3 and fail', () => {
	let retries: number = 0;
	let retried: number = 0;
	let failed: number = 0;

	interface IData {
		name: string
	}

	interface IError {
		message: string
	}

	let operation = (): Promise<IData> => {
		return new Promise((resolve: (data: IData) => void, reject: (error: IError) => void) => {
			if (retries < 5) {
				retries++;
				reject({message: `Couldn't fetch`});
			}
			else {
				resolve({name: 'John'});
			}
		});
	};

	it('should retry 3 times', (done: Function) => {
		retry({
			operation: operation,
			maxRetries: 3,
			onRetry: () => retried++,
			onFail: () => failed++,
		})
			.then((data: IData) => {
				expect(false).toBe(true);
				done();
			})
			.catch((error: IError) => {
				expect(error.message).toBe(`Couldn't fetch`);
				done();
			});
	});

	it('should use the onXxxxx callbacks', () => {
		expect(retried).toBe(retries);
		expect(failed).toBe(retried);
	});
});

describe('Dyna Retry - cancel retry', () => {
	let retries: number = 0;
	let retried: number = 0;
	let failed: number = 0;

	interface IData {
		name: string
	}

	interface IError {
		message: string
	}

	let operation = (): Promise<IData> => Promise.reject({message: 'it failed'});

	it('should cancel on 10th fail', (done: Function) => {
		retry({
			operation: operation,
			retryTimeoutBaseMs: 10,
			maxRetries: null, // retry for ever
			onRetry: (retryNo: number) => {
				retries = retryNo;
				retried++;
			},
			onFail: (retryNo: number, cancel: () => void) => {
				failed++;
				if (failed === 10) cancel();
			},
		})
			.then((data: IData) => {
				expect(false).toBe(true);
				done();
			})
			.catch((error: IError) => {
				expect(error.message).toBe(`it failed`);
				done();
			});
	});

	it('should use the onXxxxx callbacks', () => {
		expect(retried).toBe(retries);
		expect(failed).toBe(retried);
	});
});

describe('Dyna Retry - retry network fetch for success', () => {
	let retried: number = 0;
	let failed: number = 0;

	interface IError {
		message: string
	}

	it('should retry 3 times to fetch', (done: Function) => {
		retry({
			operation: () => fetch('http://www.example.com/'),
			maxRetries: 3,
			onRetry: () => retried++,
			onFail: () => failed++,
		})
			.then((value: Response) => {
				expect(!!value.body).toBe(true);
				done();
			})
			.catch((error: IError) => {
				expect(error.message).toBe(`Couldn't fetch`);
				done();
			});
	});

	it('should use the onXxxxx callbacks', () => {
		expect(retried).toBe(1);
		expect(failed).toBe(0);
	});
});

describe('Dyna Retry - retry network fetch for fail', () => {
	let retried: number = 0;
	let failed: number = 0;

	interface IError {
		message: string
	}

	it('should retry 3 times to fetch', (done: Function) => {
		retry({
			operation: () => fetch('http://www.example.comXXXX/'),
			maxRetries: 3,
			onRetry: () => retried++,
			onFail: () => failed++,
		})
			.then((value: Response) => {
				expect(!!value.body).toBe(true);
				done();
			})
			.catch((error: IError) => {
				expect(!!error).toBe(true);
				done();
			});
	});

	it('should use the onXxxxx callbacks', () => {
		expect(retried).toBe(3);
		expect(failed).toBe(3);
	});
});

