<div align='center'>

<h1>Sidewinder/Server</h1>

<p>Sidewinder Web Service and Hosting Library</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server)

</div>

## Overview

This package contains the WebService (Http), WebSocketService (Ws) and Host types used to build type safe RPC services in Node.

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [Host](#Host)
- [Express](#Express)
- [WebService](#WebService)
- [WebSocketService](#WebSocketService)
- [Lifecycle](#Lifecycle)
- [Exceptions](#Exceptions)

## Example

The following demonstrates creating a Sidewinder `WebService` and `Host`. 

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

A Sidewinder Host is a specialized Http server that supports mounting Sidewinder and Express services and middleware. The host can be thought of as combination of the [express](https://expressjs.com/) and [ws](https://github.com/websockets/ws) which provides some additional configuration options for running Web Sockets in load balanced environments.

```typescript
import { Host }   from '@sidewinder/service'
import { Router } from 'express'

const host = new Host({
    /** 
     * Load balancer keep alive. Transmits a `ping` signal to each connected 
     * web socket to prevent inactive sockets being terminated by the balancer.
     * 
     * (Default is 8000) 
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

## Express

Sidewinder Hosts are run on top express and support hosting any compatiable express middleware. Hosts only exposes the express `use(...)` function however, so applications needing to handle HTTP verbs such as `get`, `post`, `put` and `delete` will need to write these handlers on an express `Router`.

```typescript
import { Host } from '@sidewinder/server'
import { Router } from 'express'

const router = Router()
router.get('/', (req, res) => res.send('home page'))
router.get('/about', (req, res) => res.send('about page'))
router.get('/contact', (req, res) => res.send('contact page'))

const host = new Host()
host.use(router)
host.listen(5000)
```

## WebService

A WebService is JSON RPC 2.0 based HTTP service that accepts requests on singular route. The WebService type accepts a Contract on its constructor and is responsible for implementing the methods of that Contract. Method implementations can be either `sync` or `async` and accept a `clientId` for the first parameter followed by additional parameters defined in the Contract. The following implements a `echo` method on a `WebService` and hosts it on the `/v1/service` route.

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

A WebSocketService is JSON RPC 2.0 based WebSocket service that accepts incoming connectiosn from WebSocketClients. The WebSocketService works the same as the WebService but also provides an API to allow Services to call Clients. The following example implements a WebSocketService to support the WebSocketClient example located [here](https://github.com/sinclairzx81/sidewinder/blob/master/libs/client/readme.md#websocketclient).

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
import { WebSocketService } from '@sidewinder/service'
import { Contract }         from '../shared/contract'

const service = new WebSocketService(Contract)

/**
 * As there is a `progress` method defined on the client section of the
 * Contract, the WebSocketService can send messages to the clients 'progress'
 * implementation to notify of progress updates.
 */
service.method('render', async (clientId, request) => {
    /** Simulate Progress Events */
    for(let i = 0; i <= 100; i++) {
        service.send(clientId, 'progress', {
            method:  'render',
            percent: i
        })
    }
    return { 
        imageUrl: 'https://domain.com/model/model.png' 
    }
})
```
## Lifecycle

Both WebService and WebSocketService expose transport lifecycle events which are dispatched on changes to the underlying transport. These events different slightly between WebService and WebSocketService events. The following describes their behaviours.

<details>
  <summary>WebService Lifecycle Events</summary>

```typescript
export type WebServiceAuthorizeCallback = (clientId: string, request: IncomingMessage) => Promise<boolean> | boolean
export type WebServiceConnectCallback = (clientId: string) => Promise<void> | void
export type WebServiceErrorCallback = (clientId: string, error: unknown) => Promise<void> | void
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
export type WebSocketServiceErrorCallback = (clientId: string, error: unknown) => Promise<void> | void
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

## Exceptions

Sidewinder services will respond to clients using default error codes defined in the JSON RPC 2.0 specification. General errors thrown in method handlers will result in a default `InternalServerError` with minimal information returned to the client about the nature of the error. Users can override this behavior by throwing types of `Exception`. The `Exception` type is located inside the `@sidewinder/contract` package. This type can either be derived into custom error types, or thrown outright. 

The following creates some custom error types that report meaningful information to the caller.

```typescript
import { Exception } from '@sidewinder/contract'

export class UsernameAlreadyExistsException extends Exception {
    constructor(email: string) {
        super(`The email '${email}' already exists`, 1000, {})
    }
}
export class EmailAlreadyExistsException extends Exception {
    constructor(email: string) {
        super(`The email '${email}' already exists`, 1001, {})
    }
}
export class PasswordNotStrongEnoughException extends Exception {
    constructor() {
        super(`Password not strong enough`, 1002, {})
    }
}

server.method('user:create', (clientId, request) => {
    // guards
    if(await database.usernameExists(request.email)) throw new UsernameAlreadyExistsException(request.username)
    if(await database.emailExists(request.email)) throw new EmailAlreadyExistsException(request.email)
    if(!passwords.checkPasswordStength(request.password)) throw new PasswordNotStrongEnoughException(request.password)
    
    const { userId } = await database.createUser({
        username: request.username,
        password: request.password,
        email: request.email
    })
    return { userId }
})
```