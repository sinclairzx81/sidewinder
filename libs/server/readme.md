<div align='center'>

<h1>Sidewinder Server</h1>

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
- [Authorization](#Authorization)
- [Context](#Context)
- [Events](#Events)
- [Exceptions](#Exceptions)
- [Testing](#Testing)
- [Classes](#Classes)

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
service.method('add', (context, a, b) => a + b)
service.method('sub', (context, a, b) => a - b)
service.method('mul', (context, a, b) => a * b)
service.method('div', (context, a, b) => a / b)

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

Sidewinder Hosts are run on top express and support hosting any compatiable express middleware. Hosts only expose the express `use(...)` function, so applications needing to handle verbs such as `get`, `post`, `put` and `delete` will need to write these handlers via express `Router`.

```typescript
import { Host } from '@sidewinder/server'
import { Router } from 'express'

const router = Router()
router.get('/contact', (req, res) => res.send('contact page'))
router.get('/about',   (req, res) => res.send('about page'))
router.get('/',        (req, res) => res.send('home page'))

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

service.method('echo', (context, message) => message)

host.use('/service', service)

host.listen(5000)
```

## WebSocketService

A WebSocketService is JSON RPC 2.0 based WebSocket service that accepts incoming WebSocket connections from WebSocketClients. The WebSocketService offers the same functionality as the WebService but also offers an additional API to allow Services to call and send messages to WebSocketClient methods. The following example implements a WebSocketService to support the WebSocketClient example located [here](https://github.com/sinclairzx81/sidewinder/blob/master/libs/client/readme.md#websocketclient).

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

service.method('render', async (context, request) => {
    /** Simulate Progress Events */
    for(let percent = 0; percent <= 100; percent++) {
        service.send(clientId, 'progress', { method: 'render', percent })
    }
    return { 
        imageUrl: 'https://domain.com/model/model.png' 
    }
})
```
## Authorization

Both WebService and WebSocketService provide a `authorize` event that can be used to allow or disallow calls for all methods defined on a given service. The role of the `authorize` event is to either resolve a valid context for the connecting user, or to throw if the user has no access. For more information on contexts, see the [Context](#Context) section below.

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

const service = new WebService(Contract)

// ---------------------------------------------------------------------------
// Authorization
// ---------------------------------------------------------------------------

service.event('authorize', (clientId, request) => { 
    const bearer = request.headers['Authorization']
    if(isValid(bearer)) return clientId // Note: This event handler MUST return a valid
    throw Error('Not authorized')      //       context value. If not specifying a context
})                                     //       the default is string.

```

## Context

Rpc method calls are executed under a context given by the `authorize` event. By default Sidewinder WebService and WebSocketService types will automatically implement a default `authorize` handler that returns the `clientId`. This can be overridden by developers by passing a `Context` schema to the service along with a `authorize` event handler to resolve that context. The context itself is schema type checked for correctness along with any request data passed by clients.

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
// ---------------------------------------------------------------------------
// Context
//
// The following schema defines the expected context that should be returned
// for the services `authorize` event. This schema is internally type checked 
// for correctness such that if the `authorize` event returns data that fails
// to match the given schema, the service will terminate the request. Clients
// will see this as a kind of authorization failure.
// 
// ---------------------------------------------------------------------------
const Context = Type.Object({
    clientId: Type.String(),
    name:     Type.String(),
    roles:    Type.Array(Type.String())
})

// ---------------------------------------------------------------------------
// Context
//
// We pass the Context object as the second parameter on the services
// constructor. By specifying a Context, the expectation is that the service
// will implement an `authorize` event handler to resolve the context.
// 
// ---------------------------------------------------------------------------
const service = new WebService(Contract, Context)

// ---------------------------------------------------------------------------
// Authorize
//
// The following implements pseudo code that resolves the name and roles for
// the connecting user. The values return are returned as the context.
// ---------------------------------------------------------------------------

service.event('authorize', (clientId, request) => {
    const { name, roles } = await resolveIdentityFromRequest(request)
    return { clientId, name, roles }
})

// ---------------------------------------------------------------------------
// Methods
//
// Methods receive the context as the first argument on the method handler
// ---------------------------------------------------------------------------
service.method('echo', ({ clientId, name, roles }, message) => message)
```


## Events

Both WebService and WebSocketService expose transport lifecycle events which are dispatched on changes to the underlying transport. Each event passes a unique `clientId` parameter than can be used to associate user state initialized for the connection. These events have slightly different behaviors between WebService and WebSocketService. The following describes their behaviours.

<details>
  <summary>WebService Lifecycle Events</summary>

```typescript
export type WebServiceAuthorizeCallback<Context> = (clientId: string, request: IncomingMessage) => Promise<Context> | Context
export type WebServiceConnectCallback<Context>   = (context: Context) => Promise<unknown> | unknown
export type WebServiceCloseCallback<Context>     = (context: Context) => Promise<unknown> | unknown
export type WebServiceErrorCallback              = (clientId: string, error: unknown) => Promise<unknown> | unknown

/**
 * Subscribes to authorize events. This event is raised for every incoming Http Rpc request. Subscribing to 
 * this event is mandatory if the service provides a context schema. The authorize event must return a value
 * that conforms to the services context or throw if the user is not authorized.
 */
public event(event: 'authorize', callback: WebServiceAuthorizeCallback<Context>): WebServiceAuthorizeCallback<Context>

/**
 * Subscribes to connect events. This event is raised immediately following a successful 'authorize' event only.
 * This event receives the context returned from a successful authorization.
 */
public event(event: 'connect', callback: WebServiceConnectCallback<Context>): WebServiceConnectCallback<Context>

/**
 * Subscribes to close events. This event is raised whenever the remote Http request is about to close.
 * Callers should use this event to clean up any associated state created for the request. This event receives 
 * the context returned from a successful authorization.
 */
public event(event: 'close', callback: WebServiceCloseCallback<Context>): WebServiceCloseCallback<Context>

/**
 * Subscribes to error events. This event is raised if there are any http transport errors. This event
 * is usually immediately followed by a close event.
 */
public event(event: 'error', callback: WebServiceErrorCallback<Context>): WebServiceErrorCallback<Context>

```
</details>

<details>
  <summary>WebSocketService Lifecycle Events</summary>

```typescript
export type WebSocketServiceAuthorizeCallback<Context> = (clientId: string, request: IncomingMessage) => Promise<Context> | Context
export type WebSocketServiceConnectCallback<Context>   = (context: Context) => Promise<unknown> | unknown
export type WebSocketServiceCloseCallback<Context>     = (context: Context) => Promise<unknown> | unknown
export type WebSocketServiceErrorCallback              = (context: string, error: unknown) => Promise<unknown> | unknown

/**
 * Subscribes to authorize events. This event is raised once for each incoming WebSocket request. Subscribing to 
 * this event is mandatory if the service provides a context schema. The authorize event must return a value
 * that conforms to the services context or throw if the user is not authorized. This context is reused for
 * subsequence calls on this service.
 */
public event(event: 'authorize', callback: WebSocketServiceAuthorizeCallback<Context>): WebSocketServiceAuthorizeCallback<Context>

/**
 * Subscribes to connect events. This event is raised immediately following a successful 'authorize' event only.
 * This event receives the context returned from a successful authorization.
 */
public event(event: 'connect', callback: WebSocketServiceConnectCallback<Context>): WebSocketServiceConnectCallback<Context>

/**
 * Subscribes to close events. This event is raised whenever the remote WebSocket disconnects from the service.
 * Callers should use this event to clean up any associated state created for the connection. This event receives 
 * the context returned from a successful authorization.
 */
public event(event: 'close', callback: WebSocketServiceCloseCallback<Context>): WebSocketServiceCloseCallback<Context>

/**
* Subcribes to error events. This event is raised for any socket transport errors and is usually following
* immediately by a close event. This event receives the initial clientId string value only.
*/
public event(event: 'error', callback: WebSocketServiceErrorCallback): WebSocketServiceErrorCallback
```
</details>

## Exceptions

Sidewinder services will respond to clients using default error codes defined in the JSON RPC 2.0 specification. General errors thrown inside service method handlers will result in a default `InternalServerError` with minimal information returned to the client about the nature of the error. Users can override this behavior by throwing types of `Exception`. The `Exception` type is located inside the `@sidewinder/contract` package. This type can be thrown directly or derived to create specialized application errors.

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


## Testing

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-uAMyghDgHIABAZ2ABMMB3YAOwagHoBjCFmKAIZcY5AFChIsRHADqGAEYBlDFABuwLllzFSFGvSat2HaitUqxojhzgBaew8dPnL12-ce3VmwGFe-IRhvO09QsPCIx1FRHhZqeD8+QWE4AF4UdAwAOkSA4QAKBFECQmgQARgALgoAK2pecgAaYvxTNRVqooICcgE6OnJqtEwsgDEAVxZhYF58gG1h7IA5cZB5FXyASkaMkZW1jc2AXR3FrP31qC3tlrxsUWxN6OsQyLf39+DlNQ0MYI+AYDPNFYvE4G11Jo0nAWExZApvpCMPlcskYE8YrwwX06BMpjAZixoRDflkQBgYAALCB0fK9fpNOD5LgAG2AGD4AEk6DsBDt5Js0gA+OACOAAajgAueNiBcvlDmCyAw8X+CvVAJBWPgOOhAkYAmAOv6eOms3IAB5WeyuXQhYyAIw7ABMGOAhHyuoAhKl0gBmQVUkiMOAAUSgJCu5AAqrCAB6YYQYOhwKAq8YskSbIA)

Sidewinder service methods can be tested directly without implicating the network. The `method(...)` provided on each service returns an awaitable function that when called; will execute the body of the function. The returned function implements the same schema validation checks that are used to validate data received via RPC.

```typescript
import { Type }       from '@sidewinder/contract'
import { WebService } from '@sidewinder/server'

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

const Contract = Type.Contract({
    format: 'json',
    server: {
        'add': Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const service = new WebService(Contract)

const addFunction = service.method('add', (context, a, b) => a + b)

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

const add = await addFunction('<context>', 1, 2)

if(add !== 3) throw Error('Unexpected result')
```

## Classes

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-g-AMyghDgHIABAZ2ABMMB3YAO0agHoBjCVmKAENuMCgChQkWIjgAJCDRgAaOAHUMAIwDKGKADdg3LLhJlKtBszYdONXXt3ixnTnAC0Hz1+8-ff-wGB-s6uAMJ8AsIwIe5BcfEJiV5iYrysinDh-EIicAC8KOgYAHRZkSIAFAhiBETQIIIwAFyUAFY0fBRKNfh2+rot1YT4FIL09BQtaJjFAGIArqwiwHwVANrTJQBy8yAauhUAlCqbxTt7B4cAuidFZ7v7UEfHPcMUNPMak4UzC0swK1Y61O50eR1uM1BlxuP22D0uL2GeAoIHmABtvqc-stVhs7lCnsdYfcLoSYSD4YTEUiKPRgHpMXdsQDcRTSeDiQSjuT8ZTnt0CNgxNhDikXLEkpKpVKYgBZRoACx0+kMGBi0o1mqCKQwAA8pPBuGjBDQaHAADIQADmVt0MlecDR1oqxVdgigVpoLUErFQayuhxkaQ6aJKTqtLrdHpogaFQrEeoNcCNJrN8pgSvsqrgepgGHYZvU2izRgAPDAihAiJkIjkYAA+RAO4MCeYiaAVMBQemNLBQDBjPho1CO622qAtS023SBoZIj6YJ5lOuiwUOsCfNGGOBjej5OAZ4A0YogDAZiD0CqjcZdOAVI3AfMwACS9BUghUGkDeUbSEPx-DcdinDK9uEENFQz3XcKEOABuOB+xgeYoFYHc4AAajgDQcFXfANw0LduDgD5sIKf8TzPBULyvEjb3vLcn1fd9P2-X8DwVI9gLHXQuIjCgwIgjA91ouCELPZDUMEdwsJw9dN23VE0X3cjT3PS8UXROiH0Yt8dxY-I2PIwCeJA-jwMguBFJg+DEIktCACoZJFOSCO3Ok9GUjjj1Uqj1PcrSGP4Ji9Kw1iZCM7ioF40DzKEuB-NE2yULQ1xsOc+MW2IkssAKVhmDgdNMxVIwKjypgLUi54Yj6AwjGKXcr1LbSgvoetbwARhUAAmQ5igzfMKn7D40XgH9EFdYoRTgcUIDAFlWHAlJMqojJcvy+RFCOMQVpgYp5jsCoatVUUduAo88yBABWAAGW7DiAA)

Sidewinder supports class based programming by allowing RPC service types to be extended. This allows services to define dependencies via constructors and provides a basis for dependency injection. Sidewinder does not support decorators, but instead reuses the `method(...)` function defined on the base class. This allows functions to infer parameter and return types without explicit annotation.

```typescript
import { Type }             from '@sidewinder/contract'
import { Host, WebService } from '@sidewinder/server'

// ---------------------------------------------------------------------------
// Contract
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
// MathService
// ---------------------------------------------------------------------------

export class Logger { 
    log(...args: any[]) { console.log(...args) }
}

export class MathService extends WebService<typeof Contract> {
    constructor(private readonly logger: Logger) {
        super(Contract)
    }
    public add = this.method('add', (context, a, b) => { this.logger.log('called add'); return a + b })
    public sub = this.method('sub', (context, a, b) => { this.logger.log('called sub'); return a - b })
    public mul = this.method('mul', (context, a, b) => { this.logger.log('called mul'); return a * b })
    public div = this.method('div', (context, a, b) => { this.logger.log('called div'); return a / b })
}

const service = new MathService(new Logger())
// service.add('<clientId>', 1, 2).then(result => {...}) // optional

const host = new Host()
host.use(service)
host.listen(5000)
```