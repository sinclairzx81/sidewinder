<div align='center'>

<h1>Sidewinder Channel</h1>

<p>Asynchronous Channels for JavaScript</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/channel?label=%40sidewinder%2Fchannel">](https://www.npmjs.com/package/@sidewinder/channel)

</div>

## Overview

Sidewinder Channels are asynchronous channels that are somewhat modelled on Rust mpsc Channel and SyncChannel types. They are built upon JavaScript async iterators and allow values to be lazily emitted into the channel and received via `for-await` iteration. 

License MIT

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [Channel](#Channel)
- [SyncChannel](#SyncChannel)
- [Errors](#Errors)
- [Select](#Select)
- [KeepAlive](#KeepAlive)

## Example

The following shows general usage

```typescript
import { Channel } from '@sidewinder/channel'

// --------------------------------------------------------------
// Create a channel
// --------------------------------------------------------------

const channel = new Channel()

// --------------------------------------------------------------
// Sender: Write values then end
// --------------------------------------------------------------

channel.send(0)
channel.send(1)
channel.send(2)
channel.end()

// --------------------------------------------------------------
// Receiver: Await values then end
// --------------------------------------------------------------

for await(const value of channel) {
    console.log(value) // 0, 1, 2
}

console.log('done')
```

## Channel

The Channel type streams allows one to stream values to a receiver. This channel provides the `send()`, `error()` and `end()` which all push values into the channel and a `next()` function to receive the next value. Callers can read values by calling `next()` which will either return the value or `null` to indicate EOF. This channel is unbounded and a sender can send many values which will be buffered until the receiver receives the values via `next()`. 

<details>
    <summary>Example</summary>

```typescript
import { Channel } from '@sidewinder/channel'

const channel = new Channel()

channel.send(0)
channel.send(1)
channel.send(2)
channel.end()

const value0 = await channel.next()
const value1 = await channel.next()
const value2 = await channel.next()
const eof    = await channel.next() // null
```

</details>


## SyncChannel

This SyncChannel works the same as the Channel, however the Sender can await for values to be received by Receiver. This channel
can be used to prevent overwhelming the Receiver and mitigating unconstrained buffering between sender and receiver (i.e. Backpressure). The SyncChannel takes a `bound` parameter on its constructor argument that limits the number of values able to be queued before the Sender waits. Note that awaiting calls on the sender is optional and not awaiting has the same behavior as the Channel.

<details>
    <summary>Example</summary>

```typescript
import { SyncChannel } from '@sidewinder/channel'

const channel = new Channel(1)

;(async () => {
    await channel.send(0) // 1 second
    await channel.send(1) // 2 seconds
    await channel.send(2) // 3 seconds
    await channel.end()   // 4 seconds
                          // done
})()

// Receiver waits 1 second before receiving the next value
await delay(1000)
const value0 = await channel.next()
await delay(1000)
const value1 = await channel.next()
await delay(1000)
const value2 = await channel.next()
await delay(1000)
const eof = await channel.next() // null
```

</details>

## Errors

Sidewinder channels can emit errors to the Receiver to signal an issue at the Sender side. The `.error(...)` function will transmit an error and automatically `.end()` the channel for the Receiver. The receiver will throw once the error has been received. The following shows the behaviour.

<details>
    <summary>Example</summary>

```typescript
import { Channel } from '@sidewinder/channel'

const channel = new Channel()

channel.send(0)                                            // 1
channel.send(1)                                            // 2
channel.error(new Error())                                 // error
channel.end()                                              // optional: Has no effect

const value0 = await channel.next()                        // 1
const value1 = await channel.next()                        // 2
const value2 = await channel.next().catch(error => error)  // error
const eof    = await channel.next()                        // null
```


</details>


## Select

The Select function allows multiple channels to be combined into a single receiver channel. This type allows different sending processes to be combined such that a single receiver can iterate from multiple sources.

<details>
    <summary>Example</summary>

```typescript
import { Channel, Select } from '@sidewinder/channel'

const numbers = new Channel<number>()
const strings = new Channel<string>()

numbers.send(0)
strings.send('hello')
numbers.send(1)
strings.send('world')
numbers.send(2)
numbers.end()        // Note: all senders must end for the select
strings.end()        //       receiver to end.

const select = Select([numbers, strings])
await channel.next() // 0
await channel.next() // 'hello'
await channel.next() // 1
await channel.next() // 'world'
await channel.next() // 2
await channel.next() // null - eof
```

</details>


## KeepAlive

In Node environments (unlike Browser environments), the JavaScript process will terminate if there are no actions scheduled to run in the JS event loop. Because Sidewinder channels receive values without interacting with the JS event loop for performance reasons, the NodeJS runtime may terminate a process while a receiver is awaiting for values. This occurs only in scenarios where there are no other actions being scheduled on the event loop.

To ensure a process stays active, the Channel and SyncChannel constructors accept a `keepAlive` boolean argument on their constructors which schedules a `setInterval()` loop to trigger once ever 60 seconds. By enabling this it will prevent the Node runtime from termination.

### Node Process Termination

In the following example, we setup a receiver to receive values however there is no sender sending values. The expectation here would be for the receiver to await indefinately, however Node will terminate the process immediately as there is no actions being scheduled on the event loop.


<details>
    <summary>Example</summary>

```typescript
import { Channel } from '@sidewinder/channel'

const channel = new Channel()

async function receiver() {
    for await(const value of channel) {
        console.log(value)
    }
}

receiver().then(() => console.log('done'))
```

</details>

### Node Process KeepAlive

In the following example, we set the channel keepAlive to true. This will internally start a `setInterval()` loop that will continue until the sender calls `end()` on the channel. Note that the `keepAlive` should only be used in scenarios where there are no other actions being scheduled on the event loop. The follow will prevent Node from terminating the process.

<details>
    <summary>Example</summary>

```typescript
import { Channel } from '@sidewinder/channel'

const channel = new Channel(true) // keepAlive

async function receiver() {
    for await(const value of channel) {
        console.log(value)
    }
}

receiver().then(() => console.log('done'))
```

</details>