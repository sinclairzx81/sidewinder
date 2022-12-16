<div align='center'>

<h1>Sidewinder</h1>

<p>Type Safe Micro Services for Node</p>

<img src='./build/assets/sidewinder.png' />

<br />
<br />

[<img src="https://img.shields.io/npm/v/@sidewinder/async?label=%40sidewinder%2Fasync">](https://www.npmjs.com/package/@sidewinder/async) [<img src="https://img.shields.io/npm/v/@sidewinder/buffer?label=%40sidewinder%2Fbuffer">](https://www.npmjs.com/package/@sidewinder/buffer) [<img src="https://img.shields.io/npm/v/@sidewinder/channel?label=%40sidewinder%2Fchannel">](https://www.npmjs.com/package/@sidewinder/channel) [<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client) [<img src="https://img.shields.io/npm/v/@sidewinder/config?label=%40sidewinder%2Fconfig">](https://www.npmjs.com/package/@sidewinder/config) [<img src="https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract">](https://www.npmjs.com/package/@sidewinder/contract) [<img src="https://img.shields.io/npm/v/@sidewinder/events?label=%40sidewinder%2Fevents">](https://www.npmjs.com/package/@sidewinder/events) [<img src="https://img.shields.io/npm/v/@sidewinder/hash?label=%40sidewinder%2Ffetch">](https://www.npmjs.com/package/@sidewinder/fetch) [<img src="https://img.shields.io/npm/v/@sidewinder/hash?label=%40sidewinder%2Fhost">](https://www.npmjs.com/package/@sidewinder/host) [<img src="https://img.shields.io/npm/v/@sidewinder/mime?label=%40sidewinder%2Fmime">](https://www.npmjs.com/package/@sidewinder/mime) [<img src="https://img.shields.io/npm/v/@sidewinder/mongo?label=%40sidewinder%2Fmongo">](https://www.npmjs.com/package/@sidewinder/mongo) [<img src="https://img.shields.io/npm/v/@sidewinder/path?label=%40sidewinder%2Fpath">](https://www.npmjs.com/package/@sidewinder/path) [<img src="https://img.shields.io/npm/v/@sidewinder/platform?label=%40sidewinder%2Fplatform">](https://www.npmjs.com/package/@sidewinder/platform) [<img src="https://img.shields.io/npm/v/@sidewinder/query?label=%40sidewinder%2Fquery">](https://www.npmjs.com/package/@sidewinder/query) [<img src="https://img.shields.io/npm/v/@sidewinder/redis?label=%40sidewinder%2Fredis">](https://www.npmjs.com/package/@sidewinder/redis) [<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server) [<img src="https://img.shields.io/npm/v/@sidewinder/token?label=%40sidewinder%2Ftoken">](https://www.npmjs.com/package/@sidewinder/token) [<img src="https://img.shields.io/npm/v/@sidewinder/type?label=%40sidewinder%2Ftype">](https://www.npmjs.com/package/@sidewinder/type) [<img src="https://img.shields.io/npm/v/@sidewinder/validator?label=%40sidewinder%2Fvalidator">](https://www.npmjs.com/package/@sidewinder/validator) [<img src="https://img.shields.io/npm/v/@sidewinder/validator?label=%40sidewinder%2Fvalue">](https://www.npmjs.com/package/@sidewinder/value) [<img src="https://img.shields.io/npm/v/@sidewinder/websocket?label=%40sidewinder%2Fwebsocket">](https://www.npmjs.com/package/@sidewinder/websocket) [![GitHub CI](https://github.com/sinclairzx81/sidewinder/workflows/GitHub%20CI/badge.svg)](https://github.com/sinclairzx81/sidewinder/actions) 



</div>

## Overview

Sidewinder is a strictly typed and runtime validated micro service framework built for Node and Browser environments. It is designed for web service architectures where each service needs to communicate with other services in complex ways and where challenges often arise verifying each service is communicating using strict communication contracts. 

Sidewinder is developed primarily around a [runtime type system](https://github.com/sinclairzx81/typebox) based on JSON Schema. It encodes runtime type information into JavaScript directly then leverages the TypeScript language to statically infer associated static types at compile time. This approach enables distributed services to be statically checked with the TypeScript compiler, with the same runtime data assertions handled automatically by Sidewinder packages using standard JSON Schema validation.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Static and Runtime Safe](#TypeSafety)
- [Services and Clients](#ServicesAndClients)
- [Services and Metadata](#ServiceAndMetadata)
- [Build Local](#BuildLocal)

### Packages

- [Async](packages/async)
- [Buffer](packages/buffer)
- [Channel](packages/channel)
- [Client](packages/client)
- [Config](packages/config)
- [Contract](packages/contract)
- [Event](packages/events)
- [Fetch](packages/fetch)
- [Host](packages/host)
- [Mime](packages/mime)
- [Mongo](packages/mongo)
- [Path](packages/path)
- [Platform](packages/platform)
- [Query](packages/query)
- [Redis](packages/redis)
- [Server](packages/server)
- [Token](packages/token)
- [Type](packages/type)
- [Validator](packages/validator)
- [Value](packages/value)
- [WebSocket](packages/websocket)

## Install

Sidewinder consists of a number of packages that target various facets of micro service development. Each package is orientated towards type safe interactions with services and common Node infrastructure.

```bash
# Runtime Type System
$ npm install @sidewinder/type       # Json Schema Runtime Type Builder
$ npm install @sidewinder/validator  # Json Schema Validator

# Service Packages
$ npm install @sidewinder/contract   # Service Descriptions Contracts
$ npm install @sidewinder/service    # Http and Web Socket Services
$ npm install @sidewinder/client     # Http and Web Socket Clients
$ npm install @sidewinder/host       # Web Server Host

# Database and Infrastructure
$ npm install @sidewinder/query      # Query Filter Syntax for Mongo
$ npm install @sidewinder/mongo      # Type Safe Mongo
$ npm install @sidewinder/redis      # Type Safe Redis

# Messaging
$ npm install @sidewinder/async      # Asynchronous Primitives
$ npm install @sidewinder/channel    # Asynchronous Channels
$ npm install @sidewinder/events     # Portable Event Emitter

# Signing
$ npm install @sidewinder/token      # Type Safe Json Web Token

# Environment
$ npm install @sidewinder/buffer     # Operations on type Uint8Array
$ npm install @sidewinder/config     # Type Safe Configurations
$ npm install @sidewinder/platform   # Runtime Environment Checks
$ npm install @sidewinder/path       # File System Pathing Utility
```

<a name="TypeSafety"></a>

## Static and Runtime Safe

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5wGZQQhwDkAAgM7AAmGA7sAHa1QD0AxhIzFAIbswSAKFCRYiOAHUMAIwDKGKADdg7LLgJFSlGvSYtWFRUsXDR0eEmkyAwgBtgGbjnyFi5KrQbNFHB08EhIVZWOABaCMio6JjYuPiExPjg0JsuHn4YFPCk3Lz8gqigzkYKeDTuPgE4AF4UdAwAOgqMgQAKBCE4brgjZUUALkQuntGSXmpqEiG0TEaAMQBXRgFgLjaAbVmmgDlFkBlFNoBKABp6ub2Do+OAXXPtxqvDqBPjke7sIWx37ML-gGAsLZBTKVQYP5AqHQuLFLhlXrGcG1OCMehSWSglRqNotKowX59bFNEAYGAACwg1Da40mJHObXY-m4AElqOdeOcZMdagA+YajEKjUYAH2F4rFwpFHzgQvFcEl8u6ip6AGpInAwLw+CAKHA2rwhox9i8uUaTYp3oLQvKVbaZXKJUq1RrlsAAI6LLBMxzOXTcYB4RxQB02iWhpXqiJwUkUqmo3ikuBMPCKKAYaiuLQlVpZa2hiOjKNhODpmCLKCMZOMVNQdOZ3h6gAGxuuUCbhZ60tGZYrVd4cFVcBkcG+vyFMMnU+y9l9WQnU8XQLhpXgPoCKLRdAxtmZMFx6Xx5xI5JgMDAAxCjWvjRIvxKCPTFEWdngdV4dF4wDXe8a7F4dh2DSExTOcACM4HvI6CrOrBTpKtK0F2nBzrIS60bagA5vsAR6o2+qxpS1BDGUUBMJhHLmm2ZqohaUBQWGMEoShYrZF2zEocWMZkkRCZJimaYZlmxA5vibHKuJg4ak+L7wMAzati8TZAA)

Sidewinder provides both runtime and static type safety derived from Contract definitions encoded in JavaScript. It makes heavy use of TypeScript's type inference capabilities to statically infer Client and Service method signatures for defined Contracts; with data received over the network runtime checked to ensure it matches the expected parameter and return types defined for each method.

```typescript
// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

const Contract = Type.Contract({
    server: {
        'add': Type.Function([Type.Number(), Type.Number()], Type.Number())
    }
})

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class MathService extends RpcService<typeof Contract> {
  constructor() {
    super(Contract)
  }

  this.onAdd = this.method('add', (context, a, b) => {
    //                      │           │      │
    //                      │           │      └─── params (a: number, b: number)
    //                      │           │
    //                      │           └─── unique client identifier
    //                      │
    //                      └─── method name inferred from contract
    //
    //
    //      ┌─── return inferred as `number`
    //      │
    return a + b 
  })
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const client = new RpcClient(Contract, 'http://....')

const result = await client.call('add', 1, 1)
//    │                         │         │
//    │                         │         └─── arguments as (method: string, a: number, b: number)
//    │                         │ 
//    │                         └─── method name inferred from contract
//    │
//    └─── result is `number`
```

<a name="ServicesAndClients"></a>

## Services and Clients

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-g-AMyghDgHIABAZ2ABMMB3YAO0agHoBjCVmKAENuMCgFgAUKEixEcABIQaMADRwA6hgBGAZQxQAbsG5ZcJMpVoNmbDpxr6D+8VPDR4STVoDCAG2AY-DiExKTk1HSMLOz6PP6BopKSnJxwALQZmVnZObl5+QWF+cmp3nwCwjAlJXBl-EIiNHCCUFgOhsZYbDD6RMJYjDTcUMBgMMB8TTAAFoLwg8PAWliCcA7wEERw3IK+voJavhg1RACurCITrE2C7M2scBBjV7twgbz0bADmcETQIHMAHRwHTWaIcOCnBxNOoVRpwGAQOA1Ay7BhzAZzVYOIIQJxQZpwVgYGBMaAAa2aTSYGD2VIRSOUc2Mu18qDgbCI+lq8SCNVu9BBjm5IBJ0wg9CabBQ6AwOkWY2ByCg7O4s1YX2+COmWDALUEop6UBud1aMFOUAeNRgsqafwJMywZwu40mcGWvggTAZHNYqP89AxPICQQFQsMIrFEpogOqEhS6SKSeTKdTWSSEl413gsIa8AAvDLMIDc5UABQISQEe0AmAALkoACsaHwKCoq-h2viG5WJCE8BRBPR6BQG2hiwAxc6XPhlgDa44wgIAcqcQMsoGWAJRqRcrtcb7cAXV3sv36-0253HZCFBopy0o6LS6nLqu873q4vm53z-Ph63E8-y-ADrz7fsKBAU5fCfPdXxnVgPzPEDL1-T8D1QoD0O-K923A29PgMWCz3g11EIXZCMJ-U9ixQn8sMonCtzAghsEkbAtwzBM0x43i+LSGo9A6Ew4wTISjBMJowFIIxGG2PhhhJLpwCOUV+GZN17Vqco8xjcMJKwQ1xUlGpWhMYAnEJLMegAD3gXY+B+FgZgRWVBT1IRDX0JpGCINgMEFR1tUMqN6CVHUaiZcZuFczBfRrDSHmAHz9AsgLfjCYLtPqSpY3jTgan4oriuKCRJCzZQ1kcTo4ELYlvS8cTOjLUsRE4iQu06QEjIlMtB2HNs4DLayMDstRBDULQt1qgA+QkAGp3XazqTG60K+vvR81GG8pRtUZpJum-M5tWNIlskFalx6+g+qgmDtpGsaDqW2bCQAKnOjrqtW66+sIwadv4PbxsO17VlSKaMwq+BxUqurmAUJQYG3SRYZgQEoQwMtLvatHAX8ZRAjLABWAAGcn2sKkrqepmo-BDKp8rp3kYCaLNiREH0msk4FQSiWxuWkvFrCmMlthZ2KMD05AdWRfLfmAY14GSwkvHphI4CYaZjGmeTWA51mfUa77lLAVSEkSpo8W5Gp5BgGAwHGu4gocLNBRV1ZGogbhyRJdWgi1nW9YNqYkS9n2SW5rAamkc31LIq38VV7QQW9330ZQWW-j2L0tUUjEbg0bR-fgRE5YTCq1ywF2TeaLRrbylIqZplu+KhyZ4G4CX4Ya4uWZanTKjUChpntsA6xST0dl8NG6zJ8nOAodroeaYdauaJhBGATuWcBaffD6ocRzUABGNQACZl47tYH3XwRN+38WGb31kNofQaz7gS-yuvu674fnez9963Wgh-C+V9sxwEIv-LegCEgvz2H9CyYCv4QJbEcfGEAvjziPmoTaag7pqEIkeaaCY5wAGY1BpE-ufNQpNATEyPEAA)

Sidewinder services consist of three main components, a [Contract](libs/contract/readme.md), [Service](libs/server/readme.md) and [Client](libs/client/readme.md). A Contract defines a set of callable RPC methods and is shared between both Client and Server. A Service provides an implementation for a Contract; and a Client calls methods implemented on the Service. Contracts are used to infer type safe functions on Services and Clients, well as validate method calls made over the network.

The following shows general usage.

```typescript
import { RpcService }  from '@sidewinder/service'
import { RpcClient }   from '@sidewinder/client'
import { Type }        from '@sidewinder/contract'
import { Host }        from '@sidewinder/host'

// ---------------------------------------------------------------------------
// Contract
//
// Contracts are service interface descriptions that describe a set of callable
// functions and an optional encoding format. Sidewinder uses Contracts to 
// validate data sent over a network as well as to statically infer Client 
// and Server methods in TypeScript. Try changing the parameters and return 
// types for the functions below to invalidate Client and Server methods.
//
// ---------------------------------------------------------------------------

const Contract = Type.Contract({
    format: 'json',
    server: {
        'add': Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'sub': Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'mul': Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'div': Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

// ---------------------------------------------------------------------------
// Service
//
// Services provide concrete implementations for Contracts. Service methods
// receive a context along with typed parameters defined the the method. The
// static type information is derived from the Contract.
//
// ---------------------------------------------------------------------------

class MathService extends RpcService<typeof Contract> {
  constructor() {
    super(Contract)
  }
  this.onAdd = this.method('add', (context, a, b) => a + b)
  this.onSub = this.method('sub', (context, a, b) => a - b)
  this.onMul = this.method('mul', (context, a, b) => a * b)
  this.onDiv = this.method('div', (context, a, b) => a / b)
}


const host = new Host()
host.use('/math', new MathService())
host.listen(5000)

// ---------------------------------------------------------------------------
// Client
//
// Clients connect to Services. Sidewinder provides two client types. The 
// first is a WebClient which connects to WebService implementations over 
// Http, and the second is a WebSocketClient which connects to WebSocketService 
// implementations over a Web Socket. The following creates a WebClient to 
// consume the service above.
//
// ---------------------------------------------------------------------------

const client = new RpcClient(Contract, 'http://localhost:5000/math')
const add = await client.call('add', 1, 2)
const sub = await client.call('sub', 1, 2)
const mul = await client.call('mul', 1, 2)
const div = await client.call('div', 1, 2)
console.log([add, sub, mul, div]) // [3, -1, 2, 0.5]
```

<a name="ServiceAndMetadata"></a>

## Service And Metadata

Sidewinder Contracts are expressed as serializable JavaScript objects with embedded JSON schema used to represent method parameter and return types. Contracts can be used for machine readable schematics and published to remote systems, or used to generate human readable documentation.

```typescript

// ---------------------------------------------------------------------------
// This definition ...
// ---------------------------------------------------------------------------

const Contract = Type.Contract({
    format: 'json',
    server: {
        'add': Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'sub': Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'mul': Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'div': Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

// ---------------------------------------------------------------------------
// is equivalent to ...
// ---------------------------------------------------------------------------

const Contract = {
  type: 'contract',
  format: 'json',
  server: {
    'add': {
      type: 'function',
      returns: { type: 'number' },
      parameters: [
        { type: 'number' },
        { type: 'number' }
      ]
    },
    'sub': {
      type: 'function',
      returns: { type: 'number' },
      parameters: [
        { type: 'number' },
        { type: 'number' }
      ]
    },
    'mul': {
      type: 'function',
      returns: { type: 'number' },
      parameters: [
        { type: 'number' },
        { type: 'number' }
      ]
    },
    'div': {
      type: 'function',
      returns: { type: 'number' },
      parameters: [
        { type: 'number' },
        { type: 'number' }
      ]
    }
  }
}
```

<a name="BuildLocal"></a>

## Build Local

Sidewinder is built as a mono repository with each publishable package located under the libs directory. Sidewinder uses the [Hammer](https://github.com/sinclairzx81/hammer) build tooling for automated tests, builds and publishing. Sidewinder requires Node 14 LTS. The following shell commands clone the project and outline the commands provide through npm scripts.

```bash
# clone
$ git clone git@github.com:sinclairzx81/sidewinder.git
$ cd sidewinder
$ npm install

# tasks
$ npm start         # starts the example project
$ npm test          # runs the full sidewinder test suite
$ npm test channel  # runs the sidewinder channel test suite only
$ npm run format    # runs code formatting across the project
$ npm run build     # builds all packages to target/build
$ npm run clean     # cleans all build artifacts
```