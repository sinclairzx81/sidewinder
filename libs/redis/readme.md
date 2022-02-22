<div align='center'>

<h1>Sidewinder Redis</h1>

<p>Type Safe Redis for Node</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/redis?label=%40sidewinder%2Fredis">](https://www.npmjs.com/package/@sidewinder/redis)

</div>

## Overview

The Sidewinder Redis library provides a type safe abstraction over Redis. It implements remote versions of JavaScript's Array, Map and Set collection types that are modelled within Redis; with each Collection type strictly validated with Sidewinder Types. Additionally this library provides functionality for Channels and PubSub through Redis, with messages sent through Redis also strictly validated.

License MIT

## Contents

- [Overview](#Overview)
- [RedisDatabase](#RedisDatabase)
    - [RedisArray](#RedisArray)
    - [RedisMap](#RedisMap)
    - [RedisSet](#RedisSet)
- [RedisChannel](#RedisChannel)
    - [RedisSender](#RedisSender)
    - [RedisReceiver](#RedisReceiver)
- [RedisPubSub](#RedisPubSub)
    - [RedisPub](#RedisPub)
    - [RedisSub](#RedisSub)

## RedisDatabase

The Sidewinder Redis Database is a type safe interface reading and writing Redis data. It accepts a schema which defines a Array, Map and Set section with an associated type. Each of these sections correlates to JavaScript Array, Map and Set but whose data is written to Redis. The follow creates a `Vector` type which is applied to each of these sections, with example code demonstrating their usage.

<details>
<summary>Example</summary>

```typescript
import { Type, RedisDatabase } from '@sidewinder/redis'

const Vector = Type.Tuple([Type.Number(), Type.Number(), Type.Number()])

const Schema = Type.Database({
    arrays: {
        vectors: Vector // Array<[number, number, number]>
    },
    sets: {
        vectors: Vector // Set<[number, number, number]>
    },
    maps: {
        vectors: Vector // Map<string, [number, number, number]>
    }
})

const database = await RedisDatabase.connect(Schema, 'redis://172.30.1.24:6379')

// Array<[number, number, number]>
const array = database.array('vectors')
await array.push([1, 0, 0])
await array.push([0, 1, 0])
await array.push([0, 0, 1])

// Set<[number, number, number]>
const set = database.set('vectors')
await set.add([1, 0, 0])
await set.add([0, 1, 0])
await set.add([0, 0, 1])

// Map<string, [number, number, number]>
const map = database.map('vectors')
await map.set('X', [1, 0, 0])
await map.set('Y', [0, 1, 0])
await map.set('Z', [0, 0, 1])
```

</details>

### RedisArray

The RedisArray manages List data structures within Redis. It provides `push`, `pop`, `shift`, `unshift` functions as well as random indexing into elements of the Array. Elements can be enumerated using `for-await`

<details>
<summary>Example</summary>

```typescript
const array = database.array('vectors')
await array.push([1, 0, 0])
await array.push([0, 1, 0])
await array.push([0, 0, 1])

const vector = await array.get(1) // [0, 1, 0]

for await(const vector of array) {
    console.log(vector)
}
```

</details>

### RedisMap

The RedisMap manages a Dictionary data structure within Redis and is analogous to the JavaScript Map collection. It `set`, `get`, `has` and `delete` and entries can be enumerated using `for-await`

<details>
<summary>Example</summary>

```typescript
const map = database.map('vectors')
await map.set('X', [1, 0, 0])
await map.set('Y', [0, 1, 0])
await map.set('Z', [0, 0, 1])

const Y = await map.get('Y')

for await(const [key, value] of map) {
    console.log(key, value)
}
```

</details>

### RedisSet

The RedisSet manages a Set data structure within Redis and is analogous to the JavaScript Set collection. It provides `add`, `has` and `delete` functions and entries can be enumerated using `for-await`. The RedisSet type supports adding arbitary objects to be added to Sets. This is achieved by generating sha1 object hashes of the values being added. These hashes are used as keys within Redis.

<details>
<summary>Example</summary>

```typescript
const set = database.set('vectors')
await set.add([1, 0, 0])
await set.add([0, 1, 0])
await set.add([0, 0, 1])

const exists = await vectors.has([0, 1, 2])

await set.delete([0, 1, 0])

for await(const value of vectors) {
    console.log(key, value)
}
```

</details>

## RedisChannel

The Sidewinder Redis library provides the RedisSender and RedisReceiver types that replicate the Sidewinder Channel across the network. These types are designed to be used in Multi Producer, Single Consumer architectures where multiple Producers can stream values to a single consumer over the network.

### RedisSender

The RedisSender is analogous to a SyncSender Channel. It sends messages to a single Redis list and uses `RPUSH` to push new messages on that list. RedisSender can only connect to one Redis instance per list. The following connects to a redis instance and streams logs to a `logs` list.

<details>
<summary>Example</summary>

```typescript
import { Type, RedisSender } from '@sidewinder/redis'

const sender = await RedisSender.connect(Type.String(), 'logs', 'redis://redis.domain.com:6379')

await sender.send('log message 1')
await sender.send('log message 2')
await sender.send('log message 3')
```
</details>

### RedisReceiver

The RedisReceiver is analogous to a Sidewinder Receiver Channel. It receives messages from a single Redis list and uses `BLPOP` to pull new messages from the list in a queue like fashion. RedisReceiver can only connect to one Redis instance per list. The following connects to the same Redis instance above and receives logging from the sender.

<details>
<summary>Example</summary>

```typescript
import { Type, RedisReceiver } from '@sidewinder/redis'

const receiver = await RedisReceiver.connect(Type.String(), 'logs', 'redis://redis.domain.com:6379')

for await(const message of receiver) {
    console.log(message)  // log message 1
                          // log message 2
                          // log message 3
}
```
</details>

## RedisPubSub

The Sidewinder Redis library provides the RedisPub and RedisSub types that can be used to broadcast messages out across a network. These types are designed to be used in Single Producer, Multi Consumer architectures where multiple Consumers receive published messages sent by a Producer.

### RedisPub

The RedisPub type broadcasts messages out to subscribers of a topic. RedisPub can only broadcast to one topic per instance. The following connects to a Redis instance and publishes to a `news` topic.

<details>
<summary>Example</summary>

```typescript
import { Type, RedisPub } from '@sidewinder/redis'

const sender = await RedisPub.connect(Type.String(), 'news', 'redis://redis.domain.com:6379')

await sender.send('good news')
await sender.send('bad news')
await sender.send('average news')
```
</details>

### RedisSub

The RedisSub can be used to receive messages sent to a topic. The following connects to the topic above and receives messages.

<details>
<summary>Example</summary>

```typescript
import { Type, RedisSub } from '@sidewinder/redis'

const receiver = await RedisSub.connect(Type.String(), 'logs', 'redis://redis.domain.com:6379')

for await(const message of receiver) {
    console.log(message)  // good news
                          // bad news
                          // average news
}
```
</details>