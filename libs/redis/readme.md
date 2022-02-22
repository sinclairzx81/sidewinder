<div align='center'>

<h1>Sidewinder Redis</h1>

<p>Type Safe Redis Interface</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/redis?label=%40sidewinder%2Fredis">](https://www.npmjs.com/package/@sidewinder/redis)

</div>

## Overview

The Sidewinder Redis library provides a type safe abstraction over Redis. It implements remote versions of JavaScript's Array, Map and Set collection types that are modelled within Redis; with each Collection type strictly validated with Sidewinder Types. Additionally this library provides functionality for Channels and PubSub through Redis, with messages sent through Redis also strictly validated.

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