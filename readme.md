<div align='center'>

<h1>Sidewinder</h1>

<p>Web Service Framework for Node and Browsers</p>

<hr />

<img src="https://github.com/sinclairzx81/sidewinder/blob/master/build/assets/sidewinder.png?raw=true" />

<hr />

[<img src="https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract">](https://www.npmjs.com/package/@sidewinder/contract) [<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server) [<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client)


</div>

## Overview

Sidewinder is a web service framework built for micro service architectures. It allows one to create validated RPC methods that can be trivially called over the network. It offers functionality for unidirectional (http) and bidirectional (web socket) method calls, and provides this under a unified service programming model.

This project was written to help ensure client and server applications remain in sync. It achieves this through a shared contract which is used to validate remote method calls as well as enabling static type inference for RPC methods in TypeScript. The contract can also be used for automated doc, code and ui generation.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Example](#Example)
- [Contracts](libs/contract/readme.md)
- [Servers](libs/server/readme.md)
- [Clients](libs/client/readme.md)

## Install

```bash
$ npm install @sidewinder/contract   # Service Description Contract and Runtime Types
$ npm install @sidewinder/server     # Http and Web Socket Services
$ npm install @sidewinder/client     # Http and Web Socket Clients
```

## Example

Sidewinder services consist of three main components; A contract which acts as a service description, a service which implements the contract and a client that calls methods on the service. The following shows setting up an simple math service. View the `example` project provided with this repository for a typical client server application setup. Use `npm start` to run.

Experiment on the [TypeScript Playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-g-AMyghDgHIABAZ2ABMMB3YAO0agHoBjCVmKAENuMCgChQkWIjgAJCDRgAaOAHUMAIwDKGKADdg3LLhJlKtBszYdONXXt3jJ0eEnUaAwgBtgGfjkJiUnJqOkYWdl0eHz9RMTFOTjgAWlS09IzMrOyc3LychKSPPgFhGEKU-Krqmtr0+N5WRThi-iEROABeFHQMADpW0pEACgQxAjt9XQAuRHHAuEF6elm0TD6AMQBXVhFgPmGAbTX+gDktkA1dYYBKFRO+88vrm4Bde97Hi6uoW7v5wI0LYaVafba7GD7VhHB5PH63D7rOEvd49JHfF7-BZwEBbLyg9bgvYHY6fZG-O5os4Yimo2E0v5KAGEejAPQE-pEyEk+nPCmI6l8250skMm5Y-DYMTYG7xRKVOqKpVKio6fSGDAVZXanX5Bp8ZqTAxGLpwVjMNSaNXGjDDQbtGCyo0avogDAwAAWEHowwoS3oFBUw24MX4AEl6CpBCoNDcugA+RZwADUcFjYmdRld7q9PooQI0gbgwdDMAjUZjcc6icEKTTTvsLrdnu9vtxXiLJd84cji0rCaTACp6xnG1nm7nfay9J2Q92y73o-WB7WkumtbrN1vUhV5IoN9vD8r9U14F7mt1zUw5AoYLcxOeYH0tnZfZwQIJPUXMxhZY++j4ih+MMACsAAMEGygeR4wTUFTePO0GwchuQns0c6xKaV6Wp4pZ2iUDoqBQHowDAYDTIkXgQNwgheI+0zgRB76fh6FCyo0zRQBgQJePA3SCEwgjAPAGH8H0NFeF4vr+kWACMKgAEzsQaEBeP0VEAObDFxPGOnA8oAMxAA)

```typescript
import { Type }             from '@sidewinder/contract'
import { Host, WebService } from '@sidewinder/server'
import { WebClient }        from '@sidewinder/client'

// ---------------------------------------------------------------------------
// Contract
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
host.use('/math', service)
host.listen(5000)

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const client = new WebClient(Contract, 'http://localhost:5000/math')
const result = await client.call('add', 1, 2)
console.log(result) // 3
```