<div align='center'>

<h1>Sidewinder</h1>

<p>Micro Service Framework for Node</p>


<img src='https://github.com/sinclairzx81/sidewinder/blob/master/build/assets/sidewinder.png?raw=true' />

<br />
<br />

[<img src="https://img.shields.io/npm/v/@sidewinder/type?label=%40sidewinder%2Ftype">](https://www.npmjs.com/package/@sidewinder/type) [<img src="https://img.shields.io/npm/v/@sidewinder/validator?label=%40sidewinder%2Fvalidator">](https://www.npmjs.com/package/@sidewinder/validator) [<img src='https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract'>](https://www.npmjs.com/package/@sidewinder/contract) [<img src='https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver'>](https://www.npmjs.com/package/@sidewinder/server) [<img src='https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient'>](https://www.npmjs.com/package/@sidewinder/client) [<img src="https://img.shields.io/npm/v/@sidewinder/mongo?label=%40sidewinder%2Fmongo">](https://www.npmjs.com/package/@sidewinder/mongo)



</div>

## Overview

Sidewinder is a strict and fully typed Micro Service framework developed for Node. It is designed for architectures where many backend services need to communicate using a strict set of protocols as well as maintain a strict contractual agreement on how they should communicate. It provides this functionality by offering a runtime type system based on JSON schema. It uses these schemas to statically assert the correctness of Client Server interactions in TypeScript as well as to runtime assert data exchanged between systems over the wire.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Example](#Example)
- [Types](libs/type/readme.md)
- [Validation](libs/validate/readme.md)
- [Contracts](libs/contract/readme.md)
- [Servers](libs/server/readme.md)
- [Clients](libs/client/readme.md)
- [Mongo](libs/mongo/readme.md)
- [TypeScript](#TypeScript)
- [Reflection](#Reflection)

## Install

Sidewinder consists of several distinct packages

```bash
$ npm install @sidewinder/type       # JSON Schema type system
$ npm install @sidewinder/validate   # Runtime validation for types.
$ npm install @sidewinder/contract   # Json Schema + Service Descriptions
$ npm install @sidewinder/server     # Http and Web Socket Services
$ npm install @sidewinder/client     # Http and Web Socket Clients
$ npm install @sidewinder/mongo      # Mongo Driver typed with JSON Schema
```

## Example

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-g-AMyghDgHIABAZ2ABMMB3YAO0agHoBjCVmKAENuMCgChQkWIjgAJCDRgAaOAHUMAIwDKGKADdg3LLhJlKtBszYdONXXt3jJ0eEnUaAwgBtgGfjkJiUnJqOkYWdl0eHz9RMTFOTjgAWlS09IzMrOyc3LychKSPPgFhGELCuGL+IREaOEEoLDt9Qyw2GF0iYSxGGm4oYDAYYD56mAALQXg+geANLEE4O3gIIjhuQS8vQQ0vDEqiAFdWEVHWesF2BtY4CGHzrbg-Xno2AHM4ImgQaYA6OBaSwRDhwI52erVUp1OAwCBwSp6LYMaa9aZLOz+CAOKANOCsDAwJjQADWDXqTAw23JsPhimmhi2XlQcDYRF0VRi-kqV3ogPsHJAhImEHo9TYKHQGC0c2GAOQUBZ3CmrHeH1hEywYEagiFnSgl2uTRgRygt0qMCl9W+uMmWGOpxGYzgCy8ECYtNZrCRPnoqM5vn8vP5+kFwtFND+FUSKXycfjCcT6XivAu8ChtXgAF5JZg-hmygAKBBiAg234wABclAAVjQ+BQlKX8C0cdWS4E8BRBPR6BRq2g8wAxE5nPiFgDag4wfwAckcQAsoIWAJQqadzhdL1cAXXXUs3i90q7XzcCFBoRw0-dzM5HjvOk4386Py7Xt8P25Xe4-L6-p87SgQCOLwbw3e8x1YJ8Dz-Y932fLc4J-BDXxPJtAIoN49DAg8IKdKCpxgxC333PNYLfZCiNQlcAPwbAxGwFd4hjJNWLY9jkkqHRWiMaMkm4gwjHqMBSAMRgNj4AZCXacB9iFfgGWdG0qhKTNIxDQSMHqJojGABweTBVhgAARyOLBuC5GAAEk+UsfhgCIXxcWUjBhAmfFmDgJpTK0mAASs2SMHkmBFIuDYrgRGNwSwSZgHFRh7Mcjk4TgHxWDJQQaHrbhgFRPl6U6L5oA1LBvLMxR5U1IrtnddVKleGSwDk2Jxiq1sOVTaF4D1EUxSjRJKg4obhoKMRU0UZZ7DaOAcwJD13AEtpCwLEQmNbNo-h60VC27XtGzgQsLMDaz6BUQQVA0FcZoAPjxABqF01qmoxNvDegdsva8VEOyybLOi6rqzW6lmSR6xHWl6tveihgNA76jtiP6GgBm68QAKjBiGZyhnasP2n7jqR87HtRpYkkulMxngEUJtmzz5EUVcxBpvzosLLGmJZv4fEUPxCwAVgABmFpjBpG8Xxcqbxjr4gMWok1gCRET1FqEgEgXCawORE7FLHGYkNks2ErUqrBDmAA14DivF3Gl2I4CYCZDHc1MlZgcZ4QW57GuahT8PqbEOUqWQYBgMAzuuO1JtTWzLjUTQtAgbgSUJO3-Ed52Fbdj34+0JOU5gVWzZjSRfZC-27hxG3NEBfPCVN6q3QiT4pNROPbaNlL6rGBcYra72Gg0QP+s4MWJfH9jKbTQ3jpmjz5s0NOYGW1SyhUCgJlDsBK0SN1Ni8FnKyF4XOAoJjxvgHs+RzQQmEEYB4AR-g-n3rwdqv-aAEYVAAJnPqnlhXjnrfe+j9LIvyZB9K8X9f7-2nrDYBd8H4z1iBA7YO1YYwLgH-MaACsKINASg5+r9cZ6SwTg8aEB9jcwgO8ScV8VCfRULDFQWEdxXRjBOAAzCoZI39sEqEFn8fmO4gA)

Sidewinder services consist of three main components, a [Contract](libs/contract/readme.md), [Service](libs/server/readme.md) and [Client](libs/client/readme.md). A Contract defines a set of callable RPC methods and is shared between both Client and Server. A Service provides an implementation for a Contract; and a Client calls methods implemented on the Service. Contracts are used to infer type safe functions on Services and Clients, well as validate method calls made over the network.

The following shows general usage.

```typescript
import { Type }             from '@sidewinder/contract'
import { Host, WebService } from '@sidewinder/server'
import { WebClient }        from '@sidewinder/client'

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
// Services provide concrete implementations for Contracts. Services receive
// a unique clientId identifier for each new request. Implementations can 
// use this identifier to link associated state for the request. The following 
// code implements the server contract methods.
//
// ---------------------------------------------------------------------------

const service = new WebService(Contract)
service.method('add', (clientId, a, b) => a + b)
service.method('sub', (clientId, a, b) => a - b)
service.method('mul', (clientId, a, b) => a * b)
service.method('div', (clientId, a, b) => a / b)

const host = new Host()
host.use(service)
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

const client = new WebClient(Contract, 'http://localhost:5000/')
const add = await client.call('add', 1, 2)
const sub = await client.call('sub', 1, 2)
const mul = await client.call('mul', 1, 2)
const div = await client.call('div', 1, 2)
console.log([add, sub, mul, div]) // [3, -1, 2, 0.5]
```

## TypeScript

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5wGZQQhwDkAAgM7AAmGA7sAHa1QD0AxhIzFAIbswSAKFCRYiOAHUMAIwDKGKADdg7LLgJFSlGvSYtWFRUsXDR0eEmkyAwgBtgGbjnyFi5KrQbNFHB08EhIVZWOABaCMio6JjYuPiExPjg0JsuHn4YFPCk3Lz8gqigzkYKeDTuPgE4AF4UdAwAOgqMgQAKBCE4brgjZUUALkQuntGSXmpqEiG0TEaAMQBXRgFgLjaAbVmmgDlFkBlFNoBKABp6ub2Do+OAXXPtxqvDqBPjke7sIWx37ML-gGAsLZBTKVQYP5AqHQuLFLhlXrGcG1OCMehSWSglRqNotKowX59bFNEAYGAACwg1Da40mJHObXY-m4AElqOdeOcZMdagA+YajEKjUYAH2F4rFwpFHzgQvFcEl8u6ip6AGpInAwLw+CAKHA2rwhox9i8uUaTYp3oLQvKVbaZXKJUq1RrlsAAI6LLBMxzOXTcYB4RxQB02iWhpXqiJwUkUqmo3ikuBMPCKKAYaiuLQlVpZa2hiOjKNhODpmCLKCMZOMVNQdOZ3h6gAGxuuUCbhZ60tGZYrVd4cFVcBkcG+vyFMMnU+y9l9WQnU8XQLhpXgPoCKLRdAxtmZMFx6Xx5xI5JgMDAAxCjWvjRIvxKCPTFEWdngdV4dF4wDXe8a7F4dh2DSExTOcACM4HvI6CrOrBTpKtK0F2nBzrIS60bagA5vsAR6o2+qxpS1BDGUUBMJhHLmm2ZqohaUBQWGMEoShYrZF2zEocWMZkkRCZJimaYZlmxA5vibHKuJg4ak+L7wMAzati8TZAA)

Sidewinder provides both runtime and static type safety derived from Contract definitions. It is able to statically infer Client and Service method signatures in TypeScript, with data received over the network runtime checked to ensure it matches the expected parameter and return types defined for each method.

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
    //        |           |      |
    //        |           |      +--- params (a: number, b: number)
    //        |           |
    //        |           +--- unique client identifier
    //        |
    //        +--- method name inferred from contract
    //
    //
    //     +--- return inferred as `number`
    //     |
    return a + b 
})

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const client = new WebClient(Contract, 'http://....')

const result = await client.call('add', 1, 1)
//    |                         |         |
//    |                         |         +--- arguments as (method: string, a: number, b: number)
//    |                         | 
//    |                         +--- method name inferred from contract
//    |
//    +--- result is `number`
```

## Reflection

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