# About

Perform a retry on a `Promise`.

Written in Typescript, runs everywhere.

The retry come is three versions

- `DynaRetry` class
- `retry` method (wraps the `DynaRetry`)
- `DynaRetrySync` class

# DynaRetry class

## Interface

```
interface IDynaRetryConfig<TResolve> {
	operation: () => Promise<TResolve>;
	maxRetries?: number;                    // Default: 5. Set null for endless retries. 
	retryTimeoutBaseMs?: number;            // Default: 500ms
	increasePercentFrom?: number;           // Default: 20
	increasePercentTo?: number;             // Default: 60
	retryTimeoutMaxMs?: number;             // Default: 60000 (1 minute)
	delayAlgorithm?: (currentDelay: number, retryNo: number) => number; // Write your own delay algorithm. Return the amount of the next delay in ms
	onRetry?: (retryNo: number, cancel: () => void) => void;            // Informative callback
	onFail?: (error: any, retryNo: number, cancel: () => void) => void; // Informative callback
}
```

## Methods

### start(): Promise<TResolve>

The promise is resolved when the operation() is resolved.

The promise is rejected when the retry logic is expired.

When the `maxRetries` is set to null, the promise will be never rejected since the retries are endless.

### Multiple calls of start()

Since v1.3.x, you can call the `start()` so many times as you want during the retrying. The multiple `start()`s will be fulfilled, when it is ready.

This is useful when you have to keep a specific state that can be changed by external factors. 

For instance, when you want to keep a network connection on.

In the `operation()` you create or restore the connection. When the connection is already on, you simply resolve the `operation()`

If it is not created or if it is dropped, then you create/restore the connection and resolve the `operation()` when it is ready.

In the meantime, multiple `start()`s will be buffered and fulfilled on time.

This ensures that the `start()` will be always resolved when the connection is ready without concurrent executions of the restoration method.

In the meantime, if the `operation()` fails, if the connection couldn't be done, the `DynaRetry` will retry to execute it. The `start()` will be fulfilled when it's ready. 

## Example

```
const loadUser = new DynaRetry({
    operation: () => fetch('http://www.example.com'),
});

loadUser.start()
    .then(user => console.log('Fetched user data', user))
    .catch(error => console.log("Last retry's error', error));

```

# retry method

Retry a Promised operation.

`retry` is a **function** _that returns a Promise_ and executes a Promised function multiple times till becomes Resolved. If it exceeds the `maxRetries` it Rejects with the last occurred error.

## Usage

`retry({operation: () => void, /*other optional arguments*/}): Promise`;

`dyna-retry` is written in typescript, in `.then(result: TResult)` as `TResult` you get the data type of the Operation's Promise.

## Example

Simplest form

```
retry({operation: () => fetch('http://www.example.com/my-data.json')})
    .then((response: Response) => {
        // consume your data
    })
    .catch((error: any) => {
        // the last network error, after 5 retries
    });

```

With progress callbacks

```
retry({
    operation: () => fetch('http://www.example.com/my-data.json'),
    maxRetries: 3,
    onRetry: () => console.log('trying to connect'),
    onFail: (e) => console.log('network error', e),
})
    .then((value: Response) => {
        // consume your data
    })
    .catch((error: any) => {
        // the last network error, after 3 retries
    });

```
## Arguments

The retry function takes an object with following arguments, only the `operation`is required.

|argument|type|default value|description|
|----|----|----|----|
|operation|()=>Promise|-|`operation` should be a function that starts the operation and returns the `Promise` of it.|
|maxRetries|number|5|How many failed retries should be done before reject the `Promise`|
|retryTimeoutBaseMs|number|500|The base of the delay in ms.|
|increasePercentFrom/To|number(0...100(or more))|20/60|Add to the current delay a random percent range of the current delay. This algorithm is used when you don't override the `delayAlgorihm` (see next).|
|retryTimeoutMaxMs|number|1 * 60 * 1000, // one minute|Do not exceed this delay. This is applied even if your override the `delayAlgorihm` (see next).|
|delayAlgorihm|(currentDelay: number, retryNo_number) => number|null|Write your own delay algorithm. Return the amount of the next delay in ms.|
|onRetry|(retryNo: number, cancel: () => void) => void|null|Callback on each retry. The number of retries is passed. the `cancel` function is passed in order to cancel and stop the operation explicitly (will be rejected with the last error).|
|onFail|(error: any, retryNo: number, cancel: () => void) => void|null|Callback for each fail. The number of the retries is passed. the `cancel` function is passed in order to cancel and stop the operation explicitly (will be rejected with the last error).|

## Why random delay?

To avoid server bottlenecks on network or server failure.

Imagine that your server application has 20.000 connected users and the server goes down for any reason. If you have a reconnection timeout of 5secs, every 5secs, 20.000 clients will try to reconnect to your server at the same time. Boom! Your server might never come up again.

If for any reason you do not want random delay, define `{increasePercentFrom: 0, increasePercentTo: 0}` in the arguments.

## Delay algorithm

This is the default delay algorithm.

`delay += retryTimeoutBaseMs * randomBetween(increasePercentFrom, increasePercentTo)`

> You can override this algorithm in `delayAlgorihm` argument and implement your own.
> You can check the results of it in the `doc/DefaultDelayAlgorihm.xlsx` file


# DynaRetrySync

`DynaRetrySync` is a **class** that handles the Synchronous execution of Promises with the Retry ability.

Once the `DynaRetrySync` is instantiated, use the `add()` method to add `retries`. `retries` are the configuration objects that the `retry` function requests. So you can add retries with a different retry policy.

`DynaRetrySync` will try to fulfill synchronously the promises that are defined in the `retries` after the others Resolve or Rejection.
 
## Configuration

The `DynaRetrySync` requires the below methods

- `onFail` (**required**) is called when a`retry`has failed. In this case you should implement what to do. The options are `retry`, `skip` and `stop`.  
- `onResolve` (not required) is called when a `retry` is resolved
- `onEmpty` (not required) is called every time there are no pending Promises. This happens very often.

Example

```
// typescript is here

// instantiate the DynaRetrySync
const retrySync: DynaRetrySync = new DynaRetrySync({
    onFail: (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void) => {
        // implement here the logic, what if a retry exceeded it's `maxRetries` and it’s rejected
        item.data;    // (optional) here is the data where is passed on `retry` configuration
        retry();     // or skip() or stop()
    },
    onResolve: (item: IDynaRetryConfig<any>) => {
        item.data;    // (optional)
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
    operation: fetch('http://api.example.com/free-umbrellas'),
    maxRetries: 5,
    data: { someOtherCustomData: true }
});

```

## Methods

### add(retryItem: IDynaRetryConfig<any>): void

Add a `retry` item, exactly with the same way as you do with the `retry` function.

Example

```
retrySync.add({operation: fetch('http://www.example.com'), maxRetries: 5});
```

### start(): void

This method is required to be called only after you call the `stop()` in implementation of `onFail` callback.

Internally the method `start()` is called on `add()` call and when a `retry` is fulfilled.

## Properties

### isWorking: boolean

If it’s currently working.

### count: number

How many items are pending.

## events

The events that are passed to the constructor are defined as callbacks in the configuration object. 
### onFail: (item: IDynaRetryConfig<any>, error: any, retry: () => void, skip: () => void, stop: () => void)

**REQUIRED to be implemented.** Required because there is need to implement the logic: "what is a retry failed?".

Is called when a `retry` is rejected when the `maxRetries` are exceeded.

When this is called it's up to the application (the object user of `DynaRetrySync`) to do whatever is needed.

It is important to call one of the next methods which are provided as arguments of `onFail` callback, otherwise the execution of the rest `retries` **will be suspended**!

#### retry()

Call this to restart the execution of the pending retries. That means that the Rejected `retry` will be executed again.

#### skip()

The Rejected `retry` will be skipped and will continue with the next one. The owner with this `retry` should be informed.

#### stop()

The execution of the `retries` will be stopped. The only way to continue the execution is to call the `start()` method as soon as  the application is ready.

# Change log

## 2.0.0

- The return Generic type is optional.
- Calls of start() during the operation are buffered and resolved at the end.
- DynaReply's `onFail` signature change, the 1st argument is the current error.

