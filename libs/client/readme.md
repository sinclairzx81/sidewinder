<div align='center'>

<h1>Sidewinder/Client</h1>

<p>Sidewinder Client Library</p>

</div>

## Overview

This package contains the `WebClient` (Http) and `WebSocketClient` (Ws) client libraries used to connect to Sidewinder services. This package is designed to operate in both Node and Browser environments.

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [WebClient](#WebClient)
- [WebSocketClient](#WebSocketClient)
- [WebProxy](#WebProxy)

## Example

The following shows demonstrates creating a Sidewinder `WebClient`. The Contract is inlined for reference, but would usually be imported as a seperate shared module.

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

```typescript
import { WebClient } from '@sidewinder/client'
import { Contract } from '../shared/contract'

const client = new WebClient(Contract, 'http://localhost:5000/')
const add = await client.call('add', 1, 2)
const sub = await client.call('sub', 1, 2)
const mul = await client.call('mul', 1, 2)
const div = await client.call('div', 1, 2)
console.log([add, sub, mul, div]) // [3, -1, 2, 0.5]
```

## WebClient

The `WebClient` connects to `WebService` implementations. This client type communicates over Http and supports uni-directional request / response calling patterns only. The `WebService` client provides two methods, `call()` and `send()`. The first argument is the name of the method to call, with subsequent arguments passed as parameters to the remote function.

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

```typescript
import { WebClient } from '@sidewinder/client'
import { Contract } from '../shared/contract'

const client = new WebClient(Contract, 'http://localhost:5000/')

// --------------------------------------------------------------------------------
// Use the call() function to execute a remote service method and obtain a result.
// --------------------------------------------------------------------------------

const result = client.call('add', 1, 2)

// --------------------------------------------------------------------------------
// Use the send() function to execute a remote method and ignore the result. Note
// the send() function returns void and should only be used for transient
// notification events. For the majority of cases, use call().
// --------------------------------------------------------------------------------

client.send('add', 1, 2)
```


## WebSocketClient

The `WebSocketClient` connects to `WebSocketService` implementations. This client type provides the same functionality as the `WebClient` but additionally supports bi-directional method invocation; allowing the service to execute functions on the client. The following example creates a `WebSocketClient` that connects to a `WebSocketService` that carries out a long running rendering task. We expect that this task will take a some time to complete, so this service provides a `progress` notification event (as informed by the Contract) to notify the client of rendering progress.

<details>
  <summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const RenderRequest = Type.Object({
    modelUrl: Type.String({ format: 'url' })
})

export const RenderResult = Type.Object({
    imageUrl: Type.String({ format: 'url' })
})

export const Progress = Type.Object({
    method:  Type.String(),
    percent: Type.Number()
})

export const Contract = Type.Contract({
    server: {
        render: Type.Function([RenderRequest], RenderResult),
    },
    client: {
        progress: Type.Function([Progress], Type.Any())
    }
})
```

</details>

```typescript
import { WebSocketClient } from '@sidewinder/client'
import { Contract }        from '../shared/contract'

const client = new WebSocketClient(Contract, 'ws://localhost:5000/')

// ---------------------------------------------------------------------------
// As there is a `progress` method defined on the client section of the
// contract, the WebSocketClient can register a method implementation to
// receive progress events emitted from the service.
// ---------------------------------------------------------------------------

client.method('progress', progress => {
    console.log('method',  progess.method)   // i.e: 'render'
    console.log('percent', progress.percent) // i.e: 35%
})

// ---------------------------------------------------------------------------
// Here we call the render service method here and await for the result. 
// While this operation is being run on the service, the client can expect 
// to receive a series of progress updates before the result is returned.
// ---------------------------------------------------------------------------

const result = await client.call('render', {
    modelUrl: 'https://domain.com/model/model.blend'
})

console.log(result.imageUrl)
```

## WebProxy

The `WebProxy` function will transform a `WebClient` or `WebServiceClient` into a object where remote methods can be called as functions (vs passing string names for each function). This can be more ergonimic to use in some cases. The `WebProxy` function will only transform the `call()` functions on the client. The following demonstrates its use.

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

```typescript
import { WebClient, WebProxy } from '@sidewinder/client'

const client = WebProxy(new WebClient(Contract, 'http://localhost:5000/'))
const add = await client.add(1, 2)
const sub = await client.sub(1, 2)
const mul = await client.mul(1, 2)
const div = await client.div(1, 2)
```

## Protocol

Sidewinder implements the [JSON RPC 2.0](https://www.jsonrpc.org/specification) protocol specification over both Http and Web Sockets service types.

### Http

The following calls a `WebService` function using the JavaScript `fetch()` API.

<details>
  <summary>Example</summary>

```typescript
const result = await fetch('http://localhost:5001/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        jsonrpc: '2.0',  // required
        id:      '1',    // optional if send()
        method:  'add',  // required
        params:  [1, 2], // required
    })
}).then(res => res.json())
// result = { jsonrpc: '2.0', id: '1', result: 3 }
```
</details>

### WebSockets

The following calls a `WebSocketService` function using the JavaScript `WebSocket` API. Sidewinder sends message using binary sockets only. You can use the JavaScript `TextEncoder` and `TextDecoder` to JSON to and from `Uint8Array`

<details>
  <summary>Example</summary>
  
```typescript
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const socket  = new WebSocket('ws://localhost:5001/math')
socket.binaryType = 'arraybuffer'

socket.onmessage = (event) => {
    const result = JSON.parse(decoder.decode(event.data))
    // result = { jsonrpc: '2.0', id: '1', result: 3 }
}
socket.onopen = () => {
    socket.send(encoder.encode(JSON.stringify({
        jsonrpc: '2.0',
        id:      '1',
        method:  'add',
        params:  [1, 2]
    })))
}
```
</details>


