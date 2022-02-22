<div align='center'>

<h1>Sidewinder Contract</h1>

<p>Service Interface Schematics</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/contract?label=%40sidewinder%2Fcontract">](https://www.npmjs.com/package/@sidewinder/contract)

</div>

## Overview

Sidewinder Contracts are JSON Schema interface schematics that describe callable methods on remote services. This package extends the [Sidewinder Types](../types/readme.md) package. It includes an additional Contract type that can be used to define a strict Service contract. Contracts are used both for data validation, as well as TypeScript type inference. They can also be published as machine readable documentation to remote systems.

Licence MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Contracts](#Contracts)
- [Formats](#Formats)

## Install

```bash
$ npm install @sidewinder/contract
```

## Contracts

The following creates a contract where the `server` exposes a `foo` function, and the `client` exposes a `bar` function. Servers and Clients are responsible for implementing these functions, with the `client` functions only implementable on `WebSocketClient` instances.

```typescript
import { Type } from '@sidewinder/contract'

const Contract = Type.Contract({
  format: 'json',
  server: {
    foo: Type.Function([Type.String()], Type.String()),
  },
  client: {
    bar: Type.Function([Type.String()], Type.String()),
  },
})
```

## Formats

Contracts can specify a `format` option to inform Client and Server the message encoding format that should be used to exchange messages. Sidewinder provides encoding options for `json` and `msgpack` with `json` being the default. By setting the `format` to `msgpack`, Sidewinder can exchange binary buffers of type `Uint8Array`. The following uses the `msgpack` format.

```typescript
import { Type } from '@sidewinder/contract'

const Contract = Type.Contract({
  format: 'msgpack',
  server: {
    test: Type.Function([Type.String()], Type.String()),
  },
})
```
