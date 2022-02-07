<div align='center'>

<h1>Sidewinder</h1>

<p>Web Service Framework for Node and Browsers</p>

<hr />

<img src="https://github.com/sinclairzx81/sidewinder/blob/master/build/assets/sidewinder.png?raw=true" />

<hr />

[<img src="https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract">](https://www.npmjs.com/package/@sidewinder/contract) [<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server) [<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client)


</div>

## Overview

Sidewinder is a NodeJS Web Service framework built for micro service architectures. It allows one to create validated RPC methods that can be trivially called over the network. It offers functionality for both unidirectional (http) and bidirectional (web socket) method calling patterns, and provides this functionality under a unified service programming model.

Sidewinder offers similar functionality to GRPC but uses JSON RPC 2.0 for the wire protocol, JSON Schema for message validation and optional binary message encoding using MsgPack.

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
$ npm install @sidewinder/contract   # Service Description Types
$ npm install @sidewinder/server     # Http and Web Socket Services
$ npm install @sidewinder/client     # Http and Web Socket Clients
```

## Example

Sidewinder services are built from three main components, a [Contract](libs/contract/readme.md), [Service](libs/server/readme.md) and [Client](libs/client/readme.md). A Contract defines a set of callable network methods and is shared between both Client and Server. A Service provides an implementation for a Contract; and a Client calls methods implemented on the Service. Contracts used to infer type safe functions on Services and Clients, well as validate method calls made over the network.

The following demonstrates general usage. TypeScript inference can be previewed [here](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-g-AMyghDgHIABAZ2ABMMB3YAO0agHoBjCVmKAENuMCgChQkWIjgAJCDRgAaOAHUMAIwDKGKADdg3LLhJlKtBszYdONXXt3jJ0eEnUaAwgBtgGfjkJiUnJqOkYWdl0eHz9RMTFOTjgAWlS09IzMrOyc3LychKSPPgFhGEKU-Krqmtr0+N5WRThi-iEROABeFHQMADpW0pEACgQxAjt9XQAuRHHAuEF6elm0TD6AMQBXVhFgPmGAbTX+gDktkA1dYYBKFRO+88vrm4Bde97Hi6uoW7v5wI0LYaVafba7GD7VhHB5PH63D7rOEvd49JHfF7-BZwEBbLyg9bgvYHY6fZG-O5os4Yimo2E0v5KAGEejAPQE-pEyEk+nPCmI6l8250skMm5Y-DYMTYG7xRKVOqKpVKio6fSGDAVZXanX5Bp8ZqTAxGLpwVjMNSaNXGjDDQbtGCyo0avogDAwAAWEHowwoS3oFBUw24MX4AEl6CpBCoNDcugA+RZwADUcFjYmdRld7q9PooQI0gbgwdDMAjUZjcc6icEKTTTvsLrdnu9vtxXiLJd84cji0rCaTACp6xnG1nm7nfay9J2Q92y73o-WB7WkumtbrN1vUhV5IoN9vD8r9U14F7mt1zUw5AoYLcxOeYH0tnZhpmMLLH30fIo-MMAKwAAzAbKB5HuBNQVN485gRBcG5CezRzrEppXpanilnaJQOioFAejAMBgNMiReBA3CCF4j7TEBwGcBQsqNM0-qmoITCCMA8DIfwfTkV4Xi+v6RYAIwqAATAxBrwAWLFsRxcBcU+vH8fmwLCWJEmnjieIyexnGljxFHKe2alwOJYiMfA046XJCkGXxU5siZZmMRAXj9KRADmRz+ioBYqO2KjTq8cbyocADMKjJCJpkqIBfT-q8QA). For an example of a running a Service and Client between Node and Browser applications, see the `example` project provided with this repository.

```typescript
import { Type }             from '@sidewinder/contract'
import { Host, WebService } from '@sidewinder/server'
import { WebClient }        from '@sidewinder/client'

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

const Contract = Type.Contract({
    format: 'json',
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const service = new WebService(Contract)
service.method('add', (clientId, a, b) => a + b)
service.method('sub', (clientId, a, b) => a - b)
service.method('mul', (clientId, a, b) => a * b)
service.method('div', (clientId, a, b) => a / b)

// ---------------------------------------------------------------------------
// Host
// ---------------------------------------------------------------------------

const host = new Host()
host.use(service)
host.listen(5000)

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const client = new WebClient(Contract, 'http://localhost:5000/')
const add = await client.call('add', 1, 2)
const sub = await client.call('sub', 1, 2)
const mul = await client.call('mul', 1, 2)
const div = await client.call('div', 1, 2)
console.log([add, sub, mul, div]) // [3, -1, 2, 0.5]
```