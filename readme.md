<div align='center'>

<h1>Sidewinder</h1>

<p>Web Service Framework for Node and Browsers</p>

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

Sidewinder services consist of three main components; A contract which acts as a service description, a service which implements the contract and a client that calls methods on the service. The following shows setting up an simple math service. Also refer to the `example` project provided with this repo for a typical client server application setup. Use `npm start` to run.

> Type inference can be previewed on the [TypeScript Playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgCQgZxgGjgdQKYBGAynlAG7ADGecAvnAGZQQhwDkAAmsACZ4DuwAHZ8oAejSkypNgChQkWIlyEAwgBtgeIfHpx9Bxs1adufQSNJjKm7TDkLo8JABUAnmBp7DP-UxbsXLwCwqLWEDpQAIaU9rKyYmJwALSpaekZmVnZObl5OQlJAGLAUBhw-DSUUHhRMDRRcJQRMNGxcDAAFnVwfGjVwAR4aB2dVVHq6lEE6jSS5FQ0IHhdEDxohSn52zu7e+nxzULlqi1t8AC8cO6eAHSnkTEwABQIsobz0lAAXIjvvnAojweL8bnhbkUAK5CWLACLPADaYNuADlISAhlBngBKbDItEY0g4gC6eI84IJmJxuP+vjQkIIoPJEOhsPhSOZlKJuOunPRVOxpN5dy5WOxNIBcBAkPUTLuUJhMDhQkR+P53LJIvVYqFasJYolAJ4wDIcvBCrZKo5Wv1OM1FO1JPtqMd4swtLoslo2PiiS2+wDgcDmxReAAHvBKk0anUGnASAtqB0IHAFLNljpRjQHq0npsgwXC-lDhFyp9FnArkIBCpiFJFs8c+cfeXqLdlqseM82ECeGxsM8bFodABJHjYKLYAjYysAPkBcAA1HBp7JW+CO501t36QR+3BB7ZR+PAVOZxd541kiuW-W25vt2xpep94fhzAxxOz3OFwAqG9rneG4rFuXZsMaZCvkOdifqeN4-o0SSrvmRaoWhqSbC4YxCFKEDQvAXRzEBcARAuW7lFA0JCMIADmJE4Yo8AAKwAAxsSh6GcUGJbHPA5GXHA1b8Cg6AvD6-G3JCkjdmIIB1J0+7ruJom3JoGDaM8rFsT6HFcXpuybCUQgTOobjYFGlBRDhlmTFmcDrrcun6c5uQ8eU0GZlWNb4AQGjvo2ZxPNgbCdDAMBgN8iTqBANn8d8WksbJ8lsD6RwUcMMoCVE-BRMA8AeTAtw2eo3a9vuACM2AAEypaWECzKpEA0c8NT0uoMAzn6ADMQA)

```typescript
import { Host, WebService } from '@sidewinder/server'
import { WebClient }        from '@sidewinder/client'
import { Type }             from '@sidewinder/contract'

// ---------------------------------------------------------------------------
// First we create a contract that describes the callable service methods
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
// Next we create a Service to implement the Contract
// ---------------------------------------------------------------------------

const service = new WebService(Contract)
service.method('add', (clientId, a, b) => a + b)
service.method('sub', (clientId, a, b) => a - b)
service.method('mul', (clientId, a, b) => a * b)
service.method('div', (clientId, a, b) => a / b)

// ---------------------------------------------------------------------------
// Then mount the service on a host running on port 5000
// ---------------------------------------------------------------------------

const host = new Host()
host.use('/math', service)
host.listen(5000)

// ---------------------------------------------------------------------------
// Finally, we can call the service.
// ---------------------------------------------------------------------------

const client = new WebClient(Contract, 'http://localhost:5000/math')
const result = await client.call('add', 1, 2)
console.log(result) // 3
```