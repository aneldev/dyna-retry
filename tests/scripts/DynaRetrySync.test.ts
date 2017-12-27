import {IDynaRetrySyncConfig} from "../../src";
import {DynaRetrySync} from "../../src";
import {IDynaRetryConfig} from "../../src";

const CONSOLE_DEBUG: boolean = false;

declare let jasmine: any, describe: any, expect: any, it: any;

// help: https://facebook.github.io/jest/docs/expect.html

const _debug_counters: any = {};

const fetchData = (resourceName: string, resolveAfterRetries) => {
	_debug_counters[resourceName] = 0;
	return () => new Promise((resolve: Function, reject: (error: any) => void) => {
		_debug_counters[resourceName]++;
		if (_debug_counters[resourceName] < resolveAfterRetries) {
			CONSOLE_DEBUG && console.log('--- ', resourceName, 'failed');
			reject({message: `Couldn't fetch`});
		}
		else {
			CONSOLE_DEBUG && console.log('--- ', resourceName, 'RESOLVED');
			resolve({demoData: true});
		}
	});
};

describe('Dyna Retry Sync - basic', () => {
	const retrySync: DynaRetrySync = new DynaRetrySync({
		onFail: (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => undefined,
	});

	it('should add some items in array', () => {
		retrySync.add({operation: fetchData('beach-info', 3), maxRetries: 5});
		retrySync.add({operation: fetchData('florida-salaries', 5), maxRetries: 3}); // this will fail
		retrySync.add({operation: fetchData('surf-boards', 5), maxRetries: 5});
		retrySync.add({operation: fetchData('room-service', 3), maxRetries: 5});
		expect(retrySync.count).toBe(4);
	});

	it('should stop because of unresolved item', (done: Function) => {
		// some hack for the test is required
		((retrySync as any).config as IDynaRetrySyncConfig).onFail = (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => {
			expect(retrySync.count).toBe(3);
			stop();
			done();
		};
	});

	it('is should have pending items still after 1sec', (done: Function) => {
		setTimeout(() => {
			expect(retrySync.count).toBe(3);
			done();
		}, 1000);
	});

	it('should start it again and resolve the rest', (done: Function) => {
		// some hack for the test is required
		((retrySync as any).config as IDynaRetrySyncConfig).onEmpty = () => {
			expect(retrySync.count).toBe(0);
			done();
		};
		retrySync.start();
	});
});

describe('Dyna Retry Sync - multiple retries', () => {
	const retrySync: DynaRetrySync = new DynaRetrySync({
		onFail: (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => undefined,
	});

	it('adds some hard jobs to resolve', () => {
		retrySync.add({operation: fetchData('find-yourself', 3), maxRetries: 3}); // this is the only easy job here
		retrySync.add({operation: fetchData('sing-the-smelly-cat', 5), maxRetries: 3});
		retrySync.add({operation: fetchData('find-the-lord-of-the-rings', 10), maxRetries: 3});
		expect(retrySync.count).toBe(3);
	});

	it('should resolve only the one (find-your-self)', (done: Function) => {
		// some hack for the test is required
		((retrySync as any).config as IDynaRetrySyncConfig).onFail = (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => {
			expect(retrySync.count).toBe(2); // the sing-the-smelly-cat && find-the-lord-of-the-rings are pending
			retry();
			done();
		};
	});

	it('should only the last one pending', (done: Function) => {
		// some hack for the test is required
		((retrySync as any).config as IDynaRetrySyncConfig).onFail = (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => {
			expect(retrySync.count).toBe(1); // is find-the-lord-of-the-rings is still pending
			retry();
			done();
		};
	});

	it('should only the last one still pending', (done: Function) => {
		// some hack for the test is required
		((retrySync as any).config as IDynaRetrySyncConfig).onFail = (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => {
			expect(retrySync.count).toBe(1); // is find-the-lord-of-the-rings is still pending
			retry();
			done();
		};
	});

	it('should nothing pending', (done: Function) => {
		// some hack for the test is required
		((retrySync as any).config as IDynaRetrySyncConfig).onEmpty = () => {
			expect(retrySync.count).toBe(0);
			done();
		};
		retrySync.start();
	});

	it('next', () => {
		expect(true).toBe(true);
	});
});

