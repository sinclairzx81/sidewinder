<div align='center'>

<h1>Sidewinder Client</h1>

<p>Sidewinder Client Library</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client)

</div>

## Overview

This package contains the WebClient and WebSocketClient client types to connect to WebService and WebSocketService services respectively. This package can be used in both Node and Browser environments. For consuming Sidewinder service in other languages see the [Protocol](#Protocol) section below.

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [WebClient](#WebClient)
- [WebSocketClient](#WebSocketClient)
- [WebProxy](#WebProxy)
- [Protocol](#Protocol)

## Example

The following shows general usage of the Sidewinder WebClient.

<details>
<summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})
```
</details>

<details>
<summary>Example</summary>

```typescript
import { WebClient } from '@sidewinder/client'

const client = new WebClient(Contract, 'http://localhost:5000/')
const add = await client.call('add', 1, 2)
const sub = await client.call('sub', 1, 2)
const mul = await client.call('mul', 1, 2)
const div = await client.call('div', 1, 2)
console.log([add, sub, mul, div]) // [3, -1, 2, 0.5]
```
</details>

## WebClient

The WebClient connects to WebService server implementations. This client type uses Http for the transport and only supports uni-directional request response calling patterns only. The WebClient provides two methods; `call()` and `send()`. The first argument is the name of the method to call, with subsequent arguments passed as parameters to the remote function.

<details>
<summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})
```
</details>

<details>
<summary>Example</summary>

```typescript
import { WebClient } from '@sidewinder/client'

const client = new WebClient(Contract, 'http://localhost:5000/')

/** Use the call() function to execute a remote service method and obtain a result. */
const result = client.call('add', 1, 2)

/** Use the send() function to execute a remote method and ignore the result. */
client.send('add', 1, 2)
```
</details>

## WebSocketClient

The WebSocketClient connects to WebSocketService services. This client type provides the same functionality as the WebClient but offers additional support for bi-directional method calls as well as connection retry options.

<details>
  <summary>Options</summary>

```typescript
const client = new WebSocketClient(Contract, 'ws://localhost:5000/', {
    /**
     * If true, this socket will attempt to automatically reconnect
     * to the remote service if the underlying WebSocket transport 
     * closes. 
     * 
     * (Default is false)
     */
    autoReconnectEnabled: false,
    /**
     * If true, this socket will buffer any RPC method calls if calls
     * are made while the underlying WebSocket transport is in a
     * disconnected state. This option is only available if the
     * autoReconnectEnabled option is true.
     * 
     * (Default is false)
     */
    autoReconnectBuffer: false,
    /**
     * The auto reconnection timeout. This is the period of time that
     * should elapse before a reconnection attempt is made in instances
     * the underlying WebSocket connection terminates. This option is 
     * only available if the autoReconnectEnabled option is true.
     * 
     * (Default is 4000)
     */
    autoReconnectTimeout: false
})
```

</details>

<details>
  <summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
    server: {
        task: Type.Function([], Type.Void()),
    },
    client: {
        log: Type.Function([Type.String()], Type.Void())
    }
})
```
</details>

<details>
  <summary>Server</summary>

```typescript
import { WebSocketService } from '@sidewinder/service'

const service = new WebSocketService(Contract)

service.method('task', async (context, request) => {
   await service.call(context, 'log', 'log message 1')
   await service.call(context, 'log', 'log message 2')
   await service.call(context, 'log', 'log message 3')
})
```

</details>

<details>
  <summary>Client</summary>

```typescript
import { WebSocketClient } from '@sidewinder/client'

const client = new WebSocketClient(Contract, 'ws://localhost:5000')
client.method('log', message => console.log(message)) // 'log message 1'
                                                      // 'log message 2'
                                                      // 'log message 3'

client.call('task')
```

</details>

## WebProxy

The WebProxy is a utility function that transforms either WebClient or WebServiceClient into a object where remote methods can be called as functions (vs passing string names for each function). This can be more ergonimic to use in some cases. Note the WebProxy function only transforms the `call()` function of the client. The following demonstrates its use.

<details>
<summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})
```
</details>

<details>
<summary>Example</summary>

```typescript
import { WebClient, WebProxy } from '@sidewinder/client'

const client = WebProxy(new WebClient(Contract, 'http://localhost:5000/'))
const add = await client.add(1, 2)
const sub = await client.sub(1, 2)
const mul = await client.mul(1, 2)
const div = await client.div(1, 2)
```
</details>

## Protocol

Sidewinder implements the [JSON RPC 2.0](https://www.jsonrpc.org/specification) protocol specification over both Http and Web Sockets service types. The following section details how remote systems can communicate with Sidewinder services by using common JavaScript APIs.

### Http

The following calls a WebService method using the JavaScript `fetch(...)` API. Note that the `Content-Type` must match the format described in the Contract (with is either `json` or `msgpack`). The appropriate Content Types are `application/json` or `application/x-msgpack` respectively.

<details>
  <summary>Fetch Example</summary>

```typescript
const result = await fetch('http://localhost:5001/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        jsonrpc: '2.0',
        id:      '1',    // optional: omit if send()
        method:  'add',
        params:  [1, 2],
    })
}).then(res => res.json())
// result = { jsonrpc: '2.0', id: '1', result: 3 }
```
</details>

### WebSockets

The following calls a WebSocketService method using the JavaScript WebSocket API. Note Sidewinder transmits message using binary RFC6455 sockets only. You can use the JavaScript `TextEncoder` and `TextDecoder` to JSON to and from `Uint8Array`.

<details>
  <summary>WebSocket Example</summary>
  
```typescript
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const socket  = new WebSocket('ws://localhost:5001/')
socket.binaryType = 'arraybuffer'

socket.onmessage = (event) => {
    const result = JSON.parse(decoder.decode(event.data))
    // result = { jsonrpc: '2.0', id: '1', result: 3 }
}
socket.onopen = () => {
    socket.send(encoder.encode(JSON.stringify({
        jsonrpc: '2.0',
        id:      '1',  // optional: omit if send()
        method:  'add',
        params:  [1, 2]
    })))
}
```
</details>


