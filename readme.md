<div align='center'>

<h1>Sidewinder</h1>

<p>Web Service Framework for Node and Browsers</p>

<img src="https://github.com/sinclairzx81/sidewinder/blob/master/build/assets/sidewinder.png?raw=true" />

[<img src="https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract">](https://www.npmjs.com/package/@sidewinder/contract) [<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server) [<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client)

</div>

## Overview

Sidewinder is a strictly typed NodeJS Web Service framework built primarily for micro service architectures. It enables one to create schema validated RPC methods that can be trivially called across a network. It offers functionality for both unidirectional (http) and bidirectional (web socket) method calls, and provides this functionality under a unified service programming model.

Sidewinder offers functionality similar to gRPC but uses JSON RPC 2.0 for the wire protocol, JSON Schema for message validation and offers optional binary message encoding using MsgPack.

Built with Node 16 and TypeScript 4.5

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
$ npm install @sidewinder/contract   # Function Schematics
$ npm install @sidewinder/server     # Http and Web Socket Services
$ npm install @sidewinder/client     # Http and Web Socket Clients
```

## Example

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-g-AMyghDgHIABAZ2ABMMB3YAO0agHoBjCVmKAENuMCgChQkWIjgAJCDRgAaOAHUMAIwDKGKADdg3LLhJlKtBszYdONXXt3jJ0eEnUaAwgBtgGfjkJiUnJqOkYWdl0eHz9RMTFOTjgAWlS09IzMrOyc3LychKSPPgFhGELCuGL+IREaOEEoLDYYXSJhDHqYAAtBeEYabihgDSxuQS8vQQ0vLBAMHoh6er44O31DToA6OAAhVDhK7l7WAHM2U4aqktr4VAgAVzgQQQO2PQmGPqwNCB6qmL+aBwHT6XQ7LSWCIcSoPOxdbpYNCYLRDYBgeC8cDAWZQOAwCBrGB9QwTLwHY4YbgAa3xiLgvCgTRErE6KyIcF+PUqklm834JL4NB2yCgFJO5zOdKwRAgkwgEUuYEagnmrSg9UE7DgTRgDygrHx6G2FUSKXyFstVut6XivFYimuNTKcAAvChjVtqqURAAKBBiAjrBxQABciEDgQa9Ho4eRGC2ADEHqwRMA+L6ANrxrYAOQeIFGUF9AEoVDn84XdKWALrlz2VoulsuRwI0B4aOOe5OpmDp1hZisFptlj2YPPD6slutjhONqctqPPB5eLvjntpjPZhuT4ujodVvczg8jxdR+jAPRrhMbvtbk9T+vj+dHp9z3fNpStnBibAl+JmjaQHASBySVKCBhGKaSQQZs9RgKQBiMAyfBDAszTgHysSCg6cCyni3q3MKIL2JsOpUhgl4YJUghwCmwAAI4PM0jD8MARC+Hi+FwBgwjdHArJMORTGdDAOwAJKYRg-LEneuHjIacJYD0wA0DyrF9hxuj4oSgg0DQEDcMA3zSgygIwOJ9BwCw-yKCZTRMcATRWdxPRYA5zGKDslTIPSsryoqKHIby0mxAiWAAAbBroEVOj68Bqt0SzCtB5qgelGVZHaQrwMGZHuoJaiaLBRi+oRZT-nlRhbIlSy+hQggxhQKi+tw5mWSoggqBoJZugAfFcADUnKVaR1W1fQ9XthozVwK17X0J13W9a6A20ckI1iFVCYTfVIArrN82+PwHUNMt-VXAAVJt201QsSWTRQF56IdbXHRZi1nSNF20UkPXZQ68BJY6BXMHICgwKWYjA2JSm+tt-4w1sPiKH4voAKwAAzY-+lSZfjBOVN472pcTYUoawrIiDpJEbEYxG+WM5n1BF4yTKWsVECmm6GqpcBsEQujOZUpjkG5cW3CKflyl4CoXBTVMwF0hLi9tcAwxgVnTBADg0amDJkvUvHHHAEAcsASvPPdyVbKlBP2+lAOOm9sRugJYPuGT-BlTcZQqBQ3QwDAYChokstszDoZY9jnAUP+9qOo1VnuoITCCBbZnvVsbNePVSezQAjCoABM8c5WsHZu6n6eYuZ2dklNHaFyXZeA8uXhV2nGcu-w9fsxQ+1eM3cCl2ICf9Jenc15nsR97nT2XsPo8J3KCay6cWZJyo00qIPKjPTWvVmpmADMKjJEXI8qJjWzozWQA)

Sidewinder services consist of three main components, a [Contract](libs/contract/readme.md), [Service](libs/server/readme.md) and [Client](libs/client/readme.md). A Contract defines a set of callable RPC methods and is shared between both Client and Server. A Service provides an implementation for a Contract; and a Client calls methods implemented on the Service. Contracts are used to infer type safe functions on Services and Clients, well as validate method calls made over the network.

The following demonstrates general usage.

```typescript
import { Type }             from '@sidewinder/contract'
import { Host, WebService } from '@sidewinder/server'
import { WebClient }        from '@sidewinder/client'

// ---------------------------------------------------------------------------
// Contract
//
// Contracts are interfaces that describe callable methods on services. By 
// changing a Contract you may invalidate both Client or Server. Sidewinder
// uses the TypeScript compiler to statically check the correctness of both
// implementations. Try changing the following parameters and return types.
//
// ---------------------------------------------------------------------------

const Contract = Type.Contract({
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

// ---------------------------------------------------------------------------
// Service
//
// Services provide concrete implementations for Contracts. Service receive
// a unique identifier for each new request. Implementations can use this
// identifier to associate the clientId with state required for the request. 
// The following code implements the `server` Contract methods.
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
// Clients connect to Services. The clients `call()` function is inferred
// from the Contract. The following connects to the service hosted above
// anc calls each of its methods.
//
// ---------------------------------------------------------------------------

const client = new WebClient(Contract, 'http://localhost:5000/')
const add = await client.call('add', 1, 2)
const sub = await client.call('sub', 1, 2)
const mul = await client.call('mul', 1, 2)
const div = await client.call('div', 1, 2)
console.log([add, sub, mul, div]) // [3, -1, 2, 0.5]
```