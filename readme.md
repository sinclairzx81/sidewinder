<div align='center'>

<h1>Sidewinder</h1>

<p>Type Safe RPC Services for Node</p>

<img src='./build/assets/sidewinder.png' />

<br />
<br />

[<img src="https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract">](https://www.npmjs.com/package/@sidewinder/contract)
[<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client) 
[<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server)
[![GitHub CI](https://github.com/sinclairzx81/sidewinder/workflows/GitHub%20CI/badge.svg)](https://github.com/sinclairzx81/sidewinder/actions)

</div>

## Overview

Sidewinder is a strictly typed RPC client and server framework for Node. It is designed for microservice architectures and enables one to define type safe communication contracts which can be shared between client and server. It automatically handles runtime validation of data received over the network and provides automatic static type inference for RPC methods in TypeScript.

Sidewinder is developed around a [Runtime Type System](https://github.com/sinclairzx81/typebox) based on JSON Schema. It encodes runtime type information as JSON Schema into JavaScript and uses TypeScript type inference to statically infer associated static types at compile time. This approach enables distributed applications to be statically checked with the TypeScript compiler, with the same runtime type assertions handled via standard JSON Schema validation at runtime.

Sidewinder services use JSON RPC 2.0, JSON Schema and MsgPack for optional binary message encoding. It offers both Http and Web Socket service types with Web Sockets services supporting full duplex and connection retry.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Usage](#Usage)
- [Metadata](#Metadata)
- [Packages](#Packages)
- [Build](#Build)

## Install

Sidewinder provides seperate packages for Server and Client environments.

```bash
$ npm install @sidewinder/contract   # Shared RPC Interface Contract
$ npm install @sidewinder/client     # Http and Web Socket Clients
$ npm install @sidewinder/server     # Http and Web Socket Services
```

## Usage

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5wGZQQhwDkAAgM7AAmGA7sAHa1QD0AxhIzFAIbswSAKFCRYiOAHUMAIwDKGKADdg7LLgJFSlGvSYtWFRUsXDR0eEmkyAwgBtgGbjnyFi5KrQbNFHB08EhIVZWOABaCMio6JjYuPiExPjg0JsuHn4YFPCk3Lz8gqigzkYKeDTuPgE4AF4UdAwAOgqMgQAKBCE4brgjZUUALkQuntGSXmpqEiG0TEaAMQBXRgFgLjaAbVmmgDlFkBlFNoBKABp6ub2Do+OAXXPtxqvDqBPjke7sIWx37ML-gGAsLZBTKVQYP5AqHQuLFLhlXrGcG1OCMehSWSglRqNotKowX59bFNEAYGAACwg1Da40mJHObXY-m4AElqOdeOcZMdagA+YajEKjUYAH2F4rFwpFHzgQvFcEl8u6ip6AGpInAwLw+CAKHA2rwhox9i8uUaTYp3oLQvKVbaZXKJUq1RrlsAAI6LLBMxzOXTcYB4RxQB02iWhpXqiJwUkUqmo3ikuBMPCKKAYaiuLQlVpZa2hiOjKNhODpmCLKCMZOMVNQdOZ3h6gAGxuuUCbhZ60tGZYrVd4cFVcBkcG+vyFMMnU+y9l9WQnU8XQLhpXgPoCKLRdAxtmZMFx6Xx5xI5JgMDAAxCjWvjRIvxKCPTFEWdngdV4dF4wDXe8a7F4dh2DSExTOcACM4HvI6CrOrBTpKtK0F2nBzrIS60bagA5vsAR6o2+qxpS1BDGUUBMJhHLmm2ZqohaUBQWGMEoShYrZF2zEocWMZkkRCZJimaYZlmxA5vibHKuJg4ak+L7wMAzati8TZAA)

Sidewinder makes use of TypeScript static type inference to ensure Client and Server implementations match the specification defined by the Contract.

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

const service = new WebService(Contract)

service.method('add', (clientId, a, b) => {
    //        │           │      │
    //        │           │      └─── params (a: number, b: number)
    //        │           │
    //        │           └─── unique client identifier
    //        │
    //        └─── method name inferred from contract
    //
    //
    //     ┌─── return inferred as `number`
    //     │
    return a + b 
})

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const client = new WebClient(Contract, 'http://....')

const result = await client.call('add', 1, 1)
//    │                         │         │
//    │                         │         └─── arguments as (method: string, a: number, b: number)
//    │                         │ 
//    │                         └─── method name inferred from contract
//    │
//    └─── result is `number`
```


## Metadata

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

## Packages

Sidewinder is principally designed for type safe RPC but provides a number of additional other packages useful to microservice development in Node. The following packages are also available.

| Package  | Description  | Version  | 
|---|---|---|
| Async      | Provides Async Primitives  | [<img src="https://img.shields.io/npm/v/@sidewinder/async?label=%40sidewinder%2Fasync">](https://www.npmjs.com/package/@sidewinder/async)  |
| Buffer     | Buffer Utility for Uint8Array   | [<img src="https://img.shields.io/npm/v/@sidewinder/buffer?label=%40sidewinder%2Fbuffer">](https://www.npmjs.com/package/@sidewinder/buffer)   |
| Channel    | Asynchronous Channels in Node | [<img src="https://img.shields.io/npm/v/@sidewinder/channel?label=%40sidewinder%2Fchannel">](https://www.npmjs.com/package/@sidewinder/channel)   | 
| Client     | Sidewinder RPC Client Libraries | [<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client)    |
| Config     | TypeSafe Configurations | [<img src="https://img.shields.io/npm/v/@sidewinder/config?label=%40sidewinder%2Fconfig">](https://www.npmjs.com/package/@sidewinder/config)     |
| Contract   | RPC Contracts | [<img src="https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract">](https://www.npmjs.com/package/@sidewinder/contract)      |
| Events     | Event Emitter for Node and Browser | [<img src="https://img.shields.io/npm/v/@sidewinder/events?label=%40sidewinder%2Fevents">](https://www.npmjs.com/package/@sidewinder/events)     |
| Hash       | Hashing Utilities | [<img src="https://img.shields.io/npm/v/@sidewinder/hash?label=%40sidewinder%2Fhash">](https://www.npmjs.com/package/@sidewinder/hash)    |
| Mime       | Mime Type Lookup | [<img src="https://img.shields.io/npm/v/@sidewinder/mime?label=%40sidewinder%2Fmime">](https://www.npmjs.com/package/@sidewinder/mime)     |
| Mongo      | TypeSafe Mongo Driver | [<img src="https://img.shields.io/npm/v/@sidewinder/mongo?label=%40sidewinder%2Fmongo">](https://www.npmjs.com/package/@sidewinder/mongo)      |
| Path       | Pathing Utility for Node and Browser | [<img src="https://img.shields.io/npm/v/@sidewinder/path?label=%40sidewinder%2Fpath">](https://www.npmjs.com/package/@sidewinder/path)      |
| Platform   | Platform Resolver | [<img src="https://img.shields.io/npm/v/@sidewinder/platform?label=%40sidewinder%2Fplatform">](https://www.npmjs.com/package/@sidewinder/platform)     |
| Redis      | TypeSafe Redis Driver | [<img src="https://img.shields.io/npm/v/@sidewinder/redis?label=%40sidewinder%2Fredis">](https://www.npmjs.com/package/@sidewinder/redis)      |
| Server     | Sidewinder RPC Server Library | [<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server)   |
| Token      | JSON Web Token Encoders | [<img src="https://img.shields.io/npm/v/@sidewinder/token?label=%40sidewinder%2Ftoken">](https://www.npmjs.com/package/@sidewinder/token)  |
| Type       | Runtime Type System | [<img src="https://img.shields.io/npm/v/@sidewinder/type?label=%40sidewinder%2Ftype">](https://www.npmjs.com/package/@sidewinder/type)   |
| Validator  | Type Validation | [<img src="https://img.shields.io/npm/v/@sidewinder/validator?label=%40sidewinder%2Fvalidator">](https://www.npmjs.com/package/@sidewinder/validator)    |
| Value      | Value Generation from Types | [<img src="https://img.shields.io/npm/v/@sidewinder/validator?label=%40sidewinder%2Fvalue">](https://www.npmjs.com/package/@sidewinder/value)   |
| Web        | Web Polyfills | [<img src="https://img.shields.io/npm/v/@sidewinder/web?label=%40sidewinder%2Fweb">](https://www.npmjs.com/package/@sidewinder/web)    |

## Build

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