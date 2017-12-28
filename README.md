# About

Perform retry on a `Promise`.

Written in Typescript, runs everywhere.

# DynaRetry

Retry an Promised operation.

`retry` is a **function** _that returns a Promise_ and executes a Promised function multiple times till becomes Resolved. If it exceeds the `maxRetries` it Rejects with the last occurred error. 

## Example

Simplest form

```
retry({operation: () => fetch('http://www.example.com/my-data.json')})
	.then((response: Response) => {
		// consume your data
	})
	.catch((error: any) => {
		// the last network error, after 5 tries
	});

```

With progress callbacks

```
retry({
	operation: () => fetch('http://www.example.com/my-data.json'),
	maxRetries: 3,
	onRetry: () => console.log('trying to connect'),
	onFail: () => console.log('network error'),
})
	.then((value: Response) => {
		// consume your data
	})
	.catch((error: any) => {
		// the last network error, after 3 tries
	});

```
## Usage

`retry({operation: () => void, /*other optional arguments*/}): Promise`;

`dyna-retry` is written in typescript, in `.then(result: TResult)` as `TResult` you get the data type of the Operation's Promise. 

## Arguments

The retry function takes an object with follow arguments, only the `operation` required.

|argument|type|default value|description|
|----|----|----|----|
|operation|()=>Promise|-|`operation` should be a function that starts the operation and returns the `Promise` of it.|
|data|any|undefined|This is not used from the DynaRetry. It's for you to pass some data for your needs.|
|maxRetries|number|5|How many failed retries should be done before reject the `Promise`|
|retryTimeoutBaseMs|number|500|The base of the delay in ms.|
|increasePercentFrom/To|number(0...100(or more))|20/60|Add to the current delay a random percent range of the current delay. This algorithm is used when you don't override the `delayAlgorithm` (see next).|
|retryTimeoutMaxMs|number|1 * 60 * 1000, // one minute|Do not exceed this delay. This is applied even if your override the `delayAlgorithm` (see next).|
|delayAlgorithm|(currentDelay: number, retryNo: number) => number|null|Write your own delay algorithm. Return the amount of next delay in ms.|
|onRetry|(retryNo: number, cancel: () => void) => void|null|Callback on each retry. The number of retries is passed. the `cancel` function is passed in order to cancel and stop the operation explicitly (will be rejected with the last error).|
|onFail|(retryNo: number, cancel: () => void) => void|null|Callback for each fail. The number of retries is passed. the `cancel` function is passed in order to cancel and stop the operation explicitly (will be rejected with the last error).|

## Why random delay?

To avoid server bottlenecks on network or server failure.

Imagine your server application has 20.000 connected users and the server goes down for any reason. If you have a reconnection timeout of 5secs, every 5secs 20.000 clients will try to reconnect to your server on the same time. Boom! Your server might never come up again.

If for any reason you do not want random delay, define in the arguments `{increasePercentFrom: 0, increasePercentTo: 0}`.

## Delay algorithm

This is the default delay algorithm.

`delay += retryTimeoutBaseMs * randomBetween(increasePercentFrom, increasePercentTo)`

> You can override this algorithm in `delayAlgorithm` argument and implement there yours one.

> You can check the results of it in `doc/DefaultDelayAlgorithm.xlsx` file


# DynaRetrySync

`DynaRetrySync` is a **class** that handles the Synchronous execution of Promises with the Retry ability.

Once the `DynaRetrySync` is instantiated, use the `add()` method to add `retries`. `retries` are the configuration objects that the `retry` function requests. So you can add retries with different retry policy. 

`DynaRetrySync` will try to fulfill synchronously the promises defined in the `retries` on next after the others Resolve or Rejection.

## Configuration

The `DynaRetrySync` requires on initialization to pass the below methods

- `onFail` (**required**) is called when any `retry` has fail (when it's `maxRetries` are exceeded) and the you should implement what to do in this case. The options are `retry`, `skip` and `stop`.  
- `onResolve` (not required) is called when a `retry` is resolved
- `onEmpty` (not required) is called every time there are no pending items. This happens very often.

Example

```
// typescript is here

// instantiate the DynaRetrySync
const retrySync: DynaRetrySync = new DynaRetrySync({
	onFail: (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => {
		// implement here the logic, what if a retry exceeded it's `maxRetries` and is rejected 
		item.data;	// (optional) here are the data where are passed on `retry` configuration
		retry(); 	// or skip() or stop()
	},
	onResolve: (item: IDynaRetryConfig<any>) => {
		item.data;	// (optional) here are the data where are passed on `retry` configuration
		// this is the resolved item
	},
	onEmpty: () => {
		console.log('no pendings');
	},
});

// add some retries
retrySync.add({
	operation: fetch('http://api.example.com/beach-request/palm-trees'), 
	data: { someCustomData: true } 
});
retrySync.add({
	operation: fetch('http://api.example.com/free-umbrelas'), 
	maxRetries: 5, 
	data: { someOtherCustomData: true } 
});

```

## Methods

### add(retryItem: IDynaRetryConfig<any>): void

Add a `retry` item, exactly with the same way as you doing with the `retry` function.

Example

```
retrySync.add({operation: fetch('http://www.example.com'), maxRetries: 5});
```

### start(): void

This method is required to be called only after you call the `stop()` in implementation of `onFail` callback.

Internally the method `start()` is called on `add()` call and when a `retry` is fulfilled.

## Properties

### isWorking: boolean

If currently is working.

### count: number

How many items are pending.

## events

The events are defined as callbacks in the configuration object that is passed to the constructor.

### onFail: (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void)

**REQUIRED to be implemented.** Required because there is need to implement the logic: "what if a retry failed?".

Is called when a `retry` is rejected as the `maxRetries` are exceeded.

When this is called it's up of the application (the object user of `DynaRetrySync`) what to do.

It is important to call one of the next methods where are provided as arguments in `onFail` otherwise the execution of the rest `retries` **will suspended**! 

#### retry()

Call this to start from the beginning the execution of the pending retries. That means that the Rejected `retry` will start from the beginning.

#### skip()

The Rejected `retry` will be skipped and will continue with the next one. The owner with this `retry` should be informed.

#### stop()

The execution of the `retries` will be stopped. The only way to continue the execution is to call the `start()` property method when the application is ready.

