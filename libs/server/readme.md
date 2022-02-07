<div align='center'>

<h1>Sidewinder/Server</h1>

<p>Sidewinder Web Service and Host Library</p>

</div>

## Overview

This package contains the `WebService` (Http), `WebSocketService` (Ws) `Host` libraries used to build Sidewinder services in Node.

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [Host](#Host)
- [WebService](#WebService)
- [WebSocketService](#WebSocketService)
- [Lifecycle](#Lifecycle)

## Example

The following demonstrates creating a Sidewinder `WebService` and `Host`. 

<details>
<details>
  <summary>Contract</summary>

```typescript
import { Type }             from '@sidewinder/contract'

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
import { Host, WebService } from '@sidewinder/server'
import { Contract } from '../shared/contract'

const service = new WebService(Contract)
service.method('add', (clientId, a, b) => a + b)
service.method('sub', (clientId, a, b) => a - b)
service.method('mul', (clientId, a, b) => a * b)
service.method('div', (clientId, a, b) => a / b)

const host = new Host()
host.use(service)
host.listen(5000)
```

## Host

A Sidewinder `Host` is a specialized Http server that supports mounting Sidewinder and Express services and middleware. The host can be thought of as amalgamation of the [express](https://expressjs.com/) and [ws](https://github.com/websockets/ws) server libraries, and provides additional configuration options for managing Web Sockets.

```typescript
import { Host }   from '@sidewinder/service'
import { Router } from 'express'

const host = new Host({
	/** 
	 * Load balancer keep alive. Transmits a `ping` signal to each connected 
     * web socket to prevent inactive sockets being terminated by the balancer.
	 * 
	 * (default is 8000) 
	 */
     keepAliveTimeout: number

     /** 
      * Disables client message compression. By default, browsers will compress web 
      * socket frames which the server needs to decompress on a per message basis. 
      * Setting this value to false means the server can skip frame decompression 
      * (reducing CPU overhead) but at the expense of adding IO / Network overhead.
      * 
      * (Default is false)
      */
     disableFrameCompression: boolean
 
     /**
      * Sets an upper limit for the number of concurrent web sockets allowed on the 
      * host. This can be useful for autoscaling scenarios where the AWS ALB will 
      * limited connections to around 4075, but where autoscaling may be dependent on
      * service latency.
      * 
      * (Default is 16384)
      */
     maxSocketCount: number 
})

// Mount express middleware on the host.
host.use(Router().get('/', (req, res) => res.send({ message: 'hello' })))

// Listen on port 5000 across all interfaces
host.listen(5000, '0.0.0.0')

// Disposes of the host and terminates all connections.
host.dispose()
```

## WebService

A `WebService` is JSON RPC 2.0 based HTTP service that accepts requests on singular route. The `WebService` accepts a Contract on its constructor and is responsible for implementing the methods of the Contract. Method implementations can be either `sync` or `async` and accept a `clientId` which is unique for each request along with the parameters defined in the Contract. The following implements a `echo` method on a `WebService` and hosts it on the `/v1/service` route.

<details>
  <summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
    server: {
        echo: Type.Function([Type.String()], Type.String())
    }
})

```
</details>

```typescript
import { WebService } from '@sidewinder/server'

const service = new WebService(Contract)

service.method('echo', (clientId, message) => message)

host.use('/v1/service', service)

host.listen(5000)
```

## WebSocketService

A `WebSocketService` is JSON RPC 2.0 based Web Socket service that accepts web sockets on singular route. The `WebSocketService` accepts a Contract on its constructor and is responsible for implementing the methods of the Contract. Method implementations can be either `sync` or `async` and accept a `clientId` which is reused for all method calls made over the connected socket.

<details>
  <summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
    server: {
        echo: Type.Function([Type.String()], Type.String())
    }
})

```
</details>

```typescript
import { WebSocketService } from '@sidewinder/server'

const service = new WebSocketService(Contract)

service.method('echo', (clientId, message) => message)

host.use('/v1/service', service)

host.listen(5000)
```

The `WebSocketService` supports bi-directional method invocation allowing it to call methods on instances of `WebSocketClient`. The following example implements a service to support the client example located [here](https://github.com/sinclairzx81/sidewinder/blob/master/libs/client/readme.md#websocketclient).

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

```typescript
import { WebSocketService } from '@sidewinder/service'
import { Contract }         from '../shared/contract'

const service = new WebSocketService(Contract)

// ---------------------------------------------------------------------------
// As there is a `progress` method defined on the client section of the
// contract, the WebSocketService can issue calls to the client signalling
// progress updates.
// ---------------------------------------------------------------------------

service.method('render', async (clientId, request) => {
    
    // Simulate progress events
    for(let i = 0; i <= 100; i++) {
        service.send(clientId, 'progress', {
            method:  'render',
            percent: i
        })
    }
    return { imageUrl: 'https://domain.com/model/model.png' }
})
```
## Lifecycle

Both WebService and WebSocketService provide transport lifecycle events which services can use to initialize data associated with both short lived Http requests and long lived Web Socket connections. The following details these events for each service type.

<details>
  <summary>WebService Lifecycle Events</summary>

```typescript
export type WebServiceAuthorizeCallback = (clientId: string, request: IncomingMessage) => Promise<boolean> | boolean
export type WebServiceConnectCallback = (clientId: string) => Promise<void> | void
export type WebServiceErrorCallback = (clientId: string, error: unknown) => void
export type WebServiceCloseCallback = (clientId: string) => Promise<void> | void

/**
* Subscribes to authorize events. This event is raised each time a http rpc request is made. Callers
* can use this event to setup any associated state for the request
*/
public event(event: 'authorize', callback: WebServiceAuthorizeCallback): WebServiceAuthorizeCallback

/**
* Subscribes to connect events. This event is raised immediately following a successful authorization.
* Callers can use this event to initialize any additional associated state for the clientId.
*/
public event(event: 'connect', callback: WebServiceConnectCallback): WebServiceConnectCallback

/**
* Subscribes to error events. This event is raised if there are any http transport errors. This event
* is usually immediately followed by a close event.
*/
public event(event: 'error', callback: WebServiceErrorCallback): WebServiceErrorCallback

/**
* Subscribes to close events. This event is raised once the http rpc method has executed and the
* http / tcp transport is about to terminate. Callers can use this event to clean up any associated
* state for the clientId.
*/
public event(event: 'close', callback: WebServiceCloseCallback): WebServiceCloseCallback
```
</details>

<details>
  <summary>WebSocketService Lifecycle Events</summary>

```typescript
export type WebSocketServiceAuthorizeCallback = (clientId: string, request: IncomingMessage) => Promise<boolean> | boolean
export type WebSocketServiceConnectCallback = (clientId: string) => Promise<void> | void
export type WebSocketServiceErrorCallback = (clientId: string, error: unknown) => void
export type WebSocketServiceCloseCallback = (clientId: string) => Promise<void> | void

/** 
 * Subscribes to authorize events. This event is raised for each connection and is used to
 * reject connections before socket upgrade. Callers should use this event to initialize any
 * associated state for the clientId.
 */
public event(event: 'authorize', callback: WebSocketServiceAuthorizeCallback): WebSocketServiceAuthorizeCallback

/**
 * Subscribes to connect events. This event is called immediately after a successful 'authorize' event.
 * Callers can use this event to transmit any provisional messages to clients, or initialize additional
 * state for the clientId.
 */
public event(event: 'connect', callback: WebSocketServiceConnectCallback): WebSocketServiceConnectCallback

/**
 * Subcribes to error events. This event is typically raised for any socket transport errors. This
 * event is usually triggered immediately before a close event.
 */
public event(event: 'error', callback: WebSocketServiceErrorCallback): WebSocketServiceErrorCallback

/**
 * Subscribes to close events. This event is raises whenever a socket disconencts from
 * the service. Callers should use this event to delete any state associated with the
 * clientId.
 */
public event(event: 'close', callback: WebSocketServiceCloseCallback): WebSocketServiceCloseCallback
```
</details>