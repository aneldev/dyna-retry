# About

Perform retry with promise operations.

Written in Typescript, runs everywhere.

# Example

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
# Usage

`retry({operation: ()=>void, /*other optional arguments*/}): Promise`;

`dyna-retry` is written in typescript, in `.then(result: TResult)` as `TResult` you get the data type of the Operation's Promise. 

# Arguments

The retry function takes an object with follow arguments, only the `operation` required.

|argument|type|default value|description|
|----|----|----|----|
|operation|()=>Promise|-|`operation` should be a function that starts the operation and returns the `Promise` of it.|
|maxRetries|number|5|How many failed retries should be done before reject the `Promise`|
|retryTimeoutBaseMs|number|500|The base of the delay in ms.|
|increasePercentFrom/To|number(0...100(or more))|20/60|Add to the current delay a random percent range of the current delay. This algorithm is used when you don't override the `delayAlgorithm` (see next).|
|retryTimeoutMaxMs|number|1 * 60 * 1000, // one minute|Do not exceed this delay. This is applied even if your override the `delayAlgorithm` (see next).|
|delayAlgorithm|(currentDelay: number, retryNo_number) => number|null|Write your own delay algorithm. Return the amount of next delay in ms.|
|onRetry|(retryNo: number, cancel: () => void) => void|null|Callback on each retry. The number of retries is passed. the `cancel` function is passed in order to cancel and stop the operation explicitly (will be rejected with the last error).|
|onFail|(retryNo: number, cancel: () => void) => void|null|Callback for each fail. The number of retries is passed. the `cancel` function is passed in order to cancel and stop the operation explicitly (will be rejected with the last error).|

# Why random delay?

To avoid server bottlenecks on network or server failure.

Imagine your server application has 20.000 connected users and the server goes down for any reason. If you have a reconnection timeout of 5secs, every 5secs 20.000 clients will try to reconnect to your server. Boom! Your server might never come up again.

If for any reason you want random delay define in the arguments `{increasePercentFrom: 0, increasePercentTo: 0}`.

# Delay algorithm

This is the default delay algorithm.

`delay += retryTimeoutBaseMs * randomBetween(increasePercentFrom, increasePercentTo)`

> You can override it in `delayAlgorithm` argument.

> You can check the results of it in `doc/DefaultDelayAlgorithm.xlsx` file


