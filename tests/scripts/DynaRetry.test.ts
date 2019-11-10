import "jest";

import {DynaRetry} from "../../src";

describe('Dyna Retry - resolve/reject multiple calls of start()', () => {
	it('should resolve the buffered start()', (done: Function) => {
		let operationCompleted = 0;
		let startResolved = 0;
		const loadImages = new DynaRetry({
			operation: async () =>
				new Promise(r => {
					setTimeout(() => {
						operationCompleted++;
						r();
					}, 1000)
				}),
		});

		loadImages.start().then(() => startResolved++);
		loadImages.start().then(() => startResolved++);
		loadImages.start().then(() => startResolved++);
		loadImages.start().then(() => startResolved++);
		loadImages.start().then(() => startResolved++);
		loadImages.start()
			.then(() => {
				expect(operationCompleted).toBe(1);
				expect(startResolved).toBe(5);
			})
			.then(() => done());
	});
});

describe('Dyna Retry - Simple error handling', () => {
	it('should reject with the last error only', (done: Function) => {
		let failed = 0;

		const loadImages = new DynaRetry({
			retryTimeoutBaseMs: 100,
			maxRetries: 3,
			increasePercentFrom: 0,
			increasePercentTo: 0,
			operation: async () => {
				await new Promise(r => setTimeout(r, 50));
				throw {message: "General error"};
			},
			onFail: () => failed++,
		});

		loadImages.start()
			.then(() => {
				fail({message: "It doesn't be resolved"})
			})
			.catch(error => {
				expect(error.message).toBe("General error");
				expect(failed).toBe(3);
			})
			.then(() => done());
	});
});
