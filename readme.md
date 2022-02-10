<div align='center'>

<h1>Sidewinder</h1>

<p>Web Service Framework for Node and Browsers</p>


<img src="https://github.com/sinclairzx81/sidewinder/blob/master/build/assets/sidewinder.png?raw=true" />

<br />

[<img src="https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract">](https://www.npmjs.com/package/@sidewinder/contract) [<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server) [<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client)



</div>

## Overview

Sidewinder is a strict and fully typed NodeJS Web Service framework built for micro service architectures. It enables one to create schema validated RPC methods that can be trivially called over a network. It offers functionality for both unidirectional (http) and bidirectional (web socket) method calls; and provides this functionality under a unified service programming model.

Sidewinder offers functionality similar to gRPC but uses JSON RPC 2.0 for the wire protocol, JSON Schema for message validation and offers optional binary message encoding using MsgPack. It also provides excellent type inference support for TypeScript as well as JavaScript.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Example](#Example)
- [Contract](libs/contract/readme.md)
- [Server](libs/server/readme.md)
- [Client](libs/client/readme.md)

## Install

```bash
$ npm install @sidewinder/contract   # Json Schema + Service Descriptions
$ npm install @sidewinder/server     # Http and Web Socket Services
$ npm install @sidewinder/client     # Http and Web Socket Clients
```

## Example

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-g-AMyghDgHIABAZ2ABMMB3YAO0agHoBjCVmKAENuMCgChQkWIjgAJCDRgAaOAHUMAIwDKGKADdg3LLhJlKtBszYdONXXt3jJ0eEnUaAwgBtgGfjkJiUnJqOkYWdl0eHz9RMTFOTjgAWlS09IzMrOyc3LychKSPPgFhGELCuGL+IREaOEEoLDt9Qyw2GF0iYSxGGm4oYDAYYD56mAALQXg+geANLEE4O3gIIjhuQS8vQQ0vDEqiAFdWEVHWesF2BtY4CGHzrbg-Xno2AHM4ImgQaYA6OBaSwRDhwI52erVUp1OAwCBwSp6LYMaa9aZLOz+CAOKANOCsDAwJjQADWDXqTAw23JsPhimmhi2XlQcDYRF0VRi-kqV3ogPsHJAhImEHo9TYKHQGC0c2GAOQUBZ3CmrHeH1hEywYEagiFnSgl2uTRgRygt0qMCl9W+uMmWGOpxGYzgCy8ECYtNZrCRPnoqM5vn8vP5+kFwtFND+FUSKXycfjCcT6XivAu8ChtXgAF5JZg-hmygAKBBiAg234wABclAAVjQ+BQlKX8C0cdWS4E8BRBPR6BRq2g8wAxE5nPiFgDag4wfwAckcQAsoIWAJQqadzhdL1cAXXXUs3i90q7XzcCFBoRw0-dzM5HjvOk4386Py7Xt8P25Xe4-L6-p87SgQCOLwbw3e8x1YJ8Dz-Y932fLc4J-BDXxPJtAIoN49DAg8IKdKCpxgxC333PNYLfZCiNQlcAPwbAxGwFd4hjJNWLY9jkkqHRWiMaMkm4gwjHqMBSAMRgNj4AZCXacB9iFfgGWdG0qhKTNIxDQSMHqJojGABweTBVhgAARyOLBuC5GAAEk+UsfhgCIXxcWUjBhAmfFmDgJpTK0mAASs2SMHkmBFIuDYrgRGNwSwSZgHFRh7Mcjk4TgHxWDJQQaHrbhgFRPl6U6L5oA1LBvLMxR5U1IrtnddVKleGSwDk2Jxiq1sOVTaF4D1EUxSjRJKg4obhoKMRU0UZZ7DaOAcwJD13AEtpCwLEQmNbNo-h60VC27XtGzgQsLMDaz6BUQQVA0FcZoAPjxABqF01qmoxNvDegdsva8VEOyybLOi6rqzW6lmSR6xHWl6tveihgNA76jtiP6GgBm68QAKjBiGZyhnasP2n7jqR87HtRpYkkulMxngEUJtmzz5EUVcxBpvzosLLGmJZv4fEUPxCwAVgABmFpjBpG8Xxcqbxjr4gMWok1gCRET1FqEgEgXCawORE7FLHGYkNks2ErUqrBDmAA14DivF3Gl2I4CYCZDHc1MlZgcZ4QW57GuahT8PqbEOUqWQYBgMAzuuO1JtTWzLjUTQtAgbgSUJO3-Ed52Fbdj34+0JOU5gVWzZjSRfZC-27hxG3NEBfPCVN6q3QiT4pNROPbaNlL6rGBcYra72Gg0QP+s4MWJfH9jKbTQ3jpmjz5s0NOYGW1SyhUCgJlDsBK0SN1Ni8FnKyF4XOAoJjxvgHs+RzQQmEEYB4AR-g-n3rwdqv-aAEYVAAJnPqnlhXjnrfe+j9LIvyZB9K8X9f7-2nrDYBd8H4z1iBA7YO1YYwLgH-MaACsKINASg5+r9cZ6SwTg8aEB9jcwgO8ScV8VCfRULDFQWEdxXRjBOAAzCoZI39sEqEFn8fmO4gA)

Sidewinder services consist of three main components, a [Contract](libs/contract/readme.md), [Service](libs/server/readme.md) and [Client](libs/client/readme.md). A Contract defines a set of callable RPC methods and is shared between both Client and Server. A Service provides an implementation for a Contract; and a Client calls methods implemented on the Service. Contracts are used to infer type safe functions on Services and Clients, well as validate method calls made over the network.

The following demonstrates general usage.

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
