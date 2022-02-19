<div align='center'>

<h1>Sidewinder</h1>

<p>Micro Service Framework for Node</p>


<img src='https://github.com/sinclairzx81/sidewinder/blob/master/build/assets/sidewinder.png?raw=true' />

<br />
<br />

[<img src="https://img.shields.io/npm/v/@sidewinder/type?label=%40sidewinder%2Ftype">](https://www.npmjs.com/package/@sidewinder/type) [<img src="https://img.shields.io/npm/v/@sidewinder/validator?label=%40sidewinder%2Fvalidator">](https://www.npmjs.com/package/@sidewinder/validator) [<img src='https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract'>](https://www.npmjs.com/package/@sidewinder/contract) [<img src='https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver'>](https://www.npmjs.com/package/@sidewinder/server) [<img src='https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient'>](https://www.npmjs.com/package/@sidewinder/client) [<img src="https://img.shields.io/npm/v/@sidewinder/mongo?label=%40sidewinder%2Fmongo">](https://www.npmjs.com/package/@sidewinder/mongo)



</div>

## Overview

Sidewinder is a strict and fully typed micro service framework built for Node and Browser environments. It is designed for architectures where many backend services need to communicate using a strict set of protocols as well as maintain a strict contractual agreement on how they should communicate. It is principally built for validated and type safe RPC over the network, but also provides a number of type safe packages that can be used for interacting with backend infrastructure in a type safe fashion.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Services](#Services)
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

## Services

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-g-AMyghDgHIABAZ2ABMMB3YAO0agHoBjCVmKAENuMCgFgAUKEixEcABIQaMADRwA6hgBGAZQxQAbsG5ZcJMpVoNmbDpxr6D+8VPDR4STVoDCAG2AY-DiExKTk1HSMLOz6PP6BopKSnJxwALQZmVnZObl5+QWF+cmp3nwCwjAlJXBl-EIiNHCCUFgOhsZYbDD6RMJYjDTcUMBgMMB8TTAAFoLwg8PAWliCcA7wEERw3IK+voJavhg1RACurCITrE2C7M2scBBjV7twgbz0bADmcETQIHMAHRwHTWaIcOCnBxNOoVRpwGAQOA1Ay7BhzAZzVYOIIQJxQZpwVgYGBMaAAa2aTSYGD2VIRSOUc2Mu18qDgbCI+lq8SCNVu9BBjm5IBJ0wg9CabBQ6AwOkWY2ByCg7O4s1YX2+COmWDALUEop6UBud1aMFOUAeNRgsqafwJMywZwu40mcGWvggTAZHNYqP89AxPICQQFQsMIrFEpogOqEhS6SKSeTKdTWSSEl413gsIa8AAvDLMIDc5UABQISQEe0AmAALkoACsaHwKCoq-h2viG5WJCE8BRBPR6BQG2hiwAxc6XPhlgDa44wgIAcqcQMsoGWAJRqRcrtcb7cAXV3sv36-0253HZCFBopy0o6LS6nLqu873q4vm53z-Ph63E8-y-ADrz7fsKBAU5fCfPdXxnVgPzPEDL1-T8D1QoD0O-K923A29PgMWCz3g11EIXZCMJ-U9ixQn8sMonCtzAghsEkbAtwzBM0x43i+LSGo9A6Ew4wTISjBMJowFIIxGG2PhhhJLpwCOUV+GZN17Vqco8xjcMJKwQ1xUlGpWhMYAnEJLMegAD3gXY+B+FgZgRWVBT1IRDX0JpGCINgMEFR1tUMqN6CVHUaiZcZuFczBfRrDSHmAHz9AsgLfjCYLtPqSpY3jTgan4oriuKCRJCzZQ1kcTo4ELYlvS8cTOjLUsRE4iQu06QEjIlMtB2HNs4DLayMDstRBDULQt1qgA+QkAGp3XazqTG60K+vvR81GG8pRtUZpJum-M5tWNIlskFalx6+g+qgmDtpGsaDqW2bCQAKnOjrqtW66+sIwadv4PbxsO17VlSKaMwq+BxUqurmAUJQYG3SRYZgQEoQwMtLvatHAX8ZRAjLABWAAGcn2sKkrqepmo-BDKp8rp3kYCaLNiREH0msk4FQSiWxuWkvFrCmMlthZ2KMD05AdWRfLfmAY14GSwkvHphI4CYaZjGmeTWA51mfUa77lLAVSEkSpo8W5Gp5BgGAwHGu4gocLNBRV1ZGogbhyRJdWgi1nW9YNqYkS9n2SW5rAamkc31LIq38VV7QQW9330ZQWW-j2L0tUUjEbg0bR-fgRE5YTCq1ywF2TeaLRrbylIqZplu+KhyZ4G4CX4Ya4uWZanTKjUChpntsA6xST0dl8NG6zJ8nOAodroeaYdauaJhBGATuWcBaffD6ocRzUABGNQACZl47tYH3XwRN+38WGb31kNofQaz7gS-yuvu674fnez9963Wgh-C+V9sxwEIv-LegCEgvz2H9CyYCv4QJbEcfGEAvjziPmoTaag7pqEIkeaaCY5wAGY1BpE-ufNQpNATEyPEAA)

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
// Services provide concrete implementations for Contracts. Service methods
// receive a context along with typed parameters defined the the method. The
// static type information is derived from the Contract.
//
// ---------------------------------------------------------------------------

const service = new WebService(Contract)
service.method('add', (context, a, b) => a + b)
service.method('sub', (context, a, b) => a - b)
service.method('mul', (context, a, b) => a * b)
service.method('div', (context, a, b) => a / b)

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