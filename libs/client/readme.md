<div align='center'>

<h1>Sidewinder/Client</h1>

<p>Sidewinder Client Library</p>

</div>

## Overview

This package contains the Http and Web Socket libraries used to connect to Sidewinder services. 

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [WebClient](#WebClient)
- [WebSocketClient](@WebSocketClient)
- [WebProxy](@WebProxy)

## Example

The following shows creating a Sidewinder WebClient. The Contract is inlined for reference, but would usually be imported as a seperate shared module.

```typescript
import { Type }      from '@sidewinder/contract'
import { WebClient } from '@sidewinder/client'

// --------------------------------------------------------------------------------
// Contract
// --------------------------------------------------------------------------------

const Contract = Type.Contract({
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

// --------------------------------------------------------------------------------
// Client
// --------------------------------------------------------------------------------

const client = new WebClient(Contract, 'http://localhost:5000/')
const add = await client.call('add', 1, 2)
const sub = await client.call('sub', 1, 2)
const mul = await client.call('mul', 1, 2)
const div = await client.call('div', 1, 2)
console.log([add, sub, mul, div]) // [3, -1, 2, 0.5]
```

## WebClient

The `WebClient` connects to `WebService` implementations. This client type communicates over Http and supports uni-directional request / response calling patterns only. The `WebService` client provides two methods, `call()` and `send()`. The first argument is the name of the method to call, with subsequent arguments passed as parameters to the remote function.

```typescript
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

```typescript
import { Type }            from '@sidewinder/contract'
import { WebSocketClient } from '@sidewinder/client'

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

const RenderRequest = Type.Object({
    modelUrl: Type.String({ format: 'url' })
})

const RenderResult = Type.Object({
    imageUrl: Type.String({ format: 'url' })
})

const Progress = Type.Object({
    method:  Type.String(),
    percent: Type.Number()
})

const Contract = Type.Contract({
    server: {
        render: Type.Function([RenderRequest], RenderResult),
    },
    client: {
        progress: Type.Function([Progress], Type.Any())
    }
})

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

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

The `WebProxy` function will transform a `WebClient` or `WebServiceClient` into a object where
remote methods can be called as functions (vs passing string names for each function). This can
be more ergonimic to use in some cases. The `WebProxy` function will only transform the `call()` 
functions on the client. The following demonstrates its use.

```typescript
import { WebClient, WebProxy } from '@sidewinder/client'

const client = WebProxy(new WebClient(Contract, 'http://localhost:5000/'))
const add = await client.add(1, 2)
const sub = await client.sub(1, 2)
const mul = await client.mul(1, 2)
const div = await client.div(1, 2)
```