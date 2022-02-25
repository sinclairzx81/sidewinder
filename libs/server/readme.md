<div align='center'>

<h1>Sidewinder Server</h1>

<p>Sidewinder Web Service and Hosting Library</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/server?label=%40sidewinder%2Fserver">](https://www.npmjs.com/package/@sidewinder/server)

</div>

## Overview

This package contains the WebService and WebSocketService types and Http Hosting infrastructure for Sidewinder services. This library can be used to build static and runtime type safe RPC services in Node.

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [Host](#Host)
- [Express](#Express)
- [WebService](#WebService)
- [WebSocketService](#WebSocketService)
- [Authorization](#Authorization)
- [Events](#Events)
- [Exceptions](#Exceptions)
- [Testing](#Testing)
- [Classes](#Classes)

## Example

The following creates a Http WebService and Hosts it on port 5000.

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
  },
})
```

</details>

<details>
  <summary>Server</summary>

```typescript
import { Host, WebService } from '@sidewinder/server'

const service = new WebService(Contract)
service.method('add', (context, a, b) => a + b)
service.method('sub', (context, a, b) => a - b)
service.method('mul', (context, a, b) => a * b)
service.method('div', (context, a, b) => a / b)

const host = new Host()
host.use(service)
host.listen(5000)
```

</details>

<details>
  <summary>Client</summary>

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

## Host

A Sidewinder Host is a Http server that hosts Sidewinder Services and Express Routers. The Host internally uses [express](https://expressjs.com/) and [ws](https://github.com/websockets/ws) to provide baseline Http Routing and WebSocket support respectively. Multiple Services can be mounted on the Host under different `path` using the Hosts `.use(...)` method.

<details>
  <summary>Host Options</summary>

```typescript
import { Host } from '@sidewinder/service'

const host = new Host({
    /**
     * Sends a `ping` signal to each connected socket to prevent inactive sockets being terminated by a load balancer.
     *
     * (Default is 8000)
     */
     keepAliveTimeout: number

     /**
      * Disables client message compression.
      *
      * (Default is false)
      */
     disableFrameCompression: boolean

     /**
      * Sets the maximum number of concurrent Web Sockets able to connect to this Host.
      *
      * (Default is 16384)
      */
     maxSocketCount: number
})

```

</details>

<details>
  <summary>Example</summary>

```typescript
import { Host } from '@sidewinder/service'
import { Router } from 'express'

const host = new Host()
host.use(Router().get('/', (req, res) => res.send({ message: 'hello' })))
host.listen(5000).then(() => console.log('Host listening on port 5000'))
```

</details>

## Express

The Sidewinder Host supports hosting Express middleware but does not expose the usual Http verb routing present on express Application objects. To use Http verb routing, create an Express Router and mount it with the Host's `.use(...)` function. The following creates a Router as well as third party Express middleware to handle Cross-Origin requests.

<details>
  <summary>Example</summary>

```typescript
import { Host } from '@sidewinder/server'
import { Router } from 'express'
import cors from 'cors'

const router = Router()
router.get('/contact', (req, res) => res.send('contact page'))
router.get('/about', (req, res) => res.send('about page'))
router.get('/', (req, res) => res.send('home page'))

const host = new Host()
host.use(cors())
host.use(router)
host.listen(5000)
```

</details>

## WebService

A WebService is JSON RPC 2.0 based Http service that accepts requests on singular route. The WebService type accepts a Contract for its constructor argument and is responsible for implementing the methods defined for that Contract. Method implementations can be either `sync` or `async` and accept a `context` for the first parameter followed by additional method parameters defined for each method in the Contract.

<details>
  <summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
  server: {
    echo: Type.Function([Type.String()], Type.String()),
  },
})
```

</details>

<details>
  <summary>Example</summary>

```typescript
import { WebService } from '@sidewinder/server'

const service = new WebService(Contract)

service.method('echo', (context, message) => message)
```

</details>

## WebSocketService

A WebSocketService is JSON RPC 2.0 based WebSocket service that accepts incoming WebSocket connections from WebSocketClients. The WebSocketService offers the same functionality as the WebService but additionally provides an API to allow Services to call methods on WebSocketClients. Bidirectional calls must be defined within the Contract, with callable client methods defined on the `client` property of the Contract.

The following creates a bidirectional contract. The service implements a `task` function, and the client implements a `log` function. The server implementation calls `log` on the client during the execution of the `task` method.

<details>
  <summary>Contract</summary>

```typescript
import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
  server: {
    task: Type.Function([], Type.Void()),
  },
  client: {
    log: Type.Function([Type.String()], Type.Void()),
  },
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
client.method('log', (message) => console.log(message)) // 'log message 1'
// 'log message 2'
// 'log message 3'

client.call('task')
```

</details>

## Authorization

Sidewinder Services provide two levels of authorization; Service level and Method level. Both WebService and WebSocketService service types implement the same authorization levels, with authorization happening on a per request basic for WebServices and one for WebSocketServices. The following sections show their usage.

### Service Level

Service level authorization is responsible for accepting incoming Http requests and verifying it's headers and parameters to produce a valid execution context. The execution context is forwarded to each method of the service via each methods `context` argument. Service level authorization occurs during an `authorize` event must produce a execution context that checks against schematics defined for the service.

<details>
  <summary>Service Level Authorization</summary>

```typescript
const Context = Type.Object({
  clientId: Type.String()
  name:     Type.String(),
  roles:    Type.Array(Type.String())
})

const service = new WebService(Contact, Context)

service.event('authorize', (clientId, request) => {
   // throw error to reject
   const { name, roles } = Token.decode(request.headers['authorization'])
   return { clientId, name, roles }
})

service.method('action', (context) => {
  const { clientId, name, roles } = context
})
```

</details>

### Method Level

The method level authorization occurs after Service authorization. The method level handler is passed the execution context produced by the Service and can optionally reject calls based on application critea (such as roles). Method level authorization can also remap the execution context, but unlike the Service level execution context, the method level context is not checked.

<details>
  <summary>Method Level Authorization</summary>

```typescript
const Context = Type.Object({
  clientId: Type.String()
  name:     Type.String(),
  roles:    Type.Array(Type.String())
})

const service = new WebService(Contact, Context)

service.event('authorize', (clientId, request) => {
   // throw error to reject
   const { name, roles } = Token.decode(request.headers['authorization'])
   return { clientId, name, roles }
})

service.method('action', (context) => {
  // throw error to reject
  return { ...context, foo: 'bar' }
}, (context) => {
  const { clientId, name, roles, foo } = context
})
```

</details>

## Events

Both WebService and WebSocketService expose transport lifecycle events which are dispatched on changes to the underlying transport. These events have slightly different behaviors between WebService and WebSocketService service types. The following shows their event signatures with comments describing their behavior.

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

Sidewinder provides an Exception type to notify callers of server application level errors. By default, if a Sidewinder service method faults, a generic error is returned to the caller giving no hints as to what occured. Server implementations can override this by throwing the Exception type.

The following creates some application specific Exceptions related to a registration sign up process.

<details>
  <summary>Example</summary>

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
  // If any of these checks fail, the caller will receive meaningful information as to what went wrong.
  if (await database.usernameExists(request.email)) throw new UsernameAlreadyExistsException(request.username)
  if (await database.emailExists(request.email)) throw new EmailAlreadyExistsException(request.email)
  if (!passwords.checkPasswordStength(request.password)) throw new PasswordNotStrongEnoughException(request.password)

  // If this throws an Error, a generic `Internal Server Error` will be returned to the caller.
  const { userId } = await database.createUser({
    username: request.username,
    password: request.password,
    email: request.email,
  })
  return { userId }
})
```

</details>

## Testing

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKZwL5z-uAMyghDgHIABAZ2ABMMB3YAOwagHoBjCFmKAIZcY5AFChIsRHADqGAEYBlDFABuwLllzFSFGvSat2HaitUqxojhzgBaew8dPnL12-ce3VmwGFe-IRhvO09QsPCIx1FRHhZqeD8+QWE4AF4UdAwAOkSA4QAKBFECQmgQARgALgoAK2pecgAaYvxTNRVqooICcgE6OnJqtEwsgDEAVxZhYF58gG1h7IA5cZB5FXyASkaMkZW1jc2AXR3FrP31qC3tlrxsUWxN6OsQyLf39+DlNQ0MYI+AYDPNFYvE4G11Jo0nAWExZApvpCMPlcskYE8YrwwX06BMpjAZixoRDflkQBgYAALCB0fK9fpNOD5LgAG2AGD4AEk6DsBDt5Js0gA+OACOAAajgAueNiBcvlDmCyAw8X+CvVAJBWPgOOhAkYAmAOv6eOms3IAB5WeyuXQhYyAIw7ABMGOAhHyuoAhKl0gBmQVUkiMOAAUSgJCu5AAqrCAB6YYQYOhwKAq8YskSbIA)

Sidewinder service methods can be tested without hosting them over a network. The WebService and WebSocketService `.method(...)` function returns the method implementation as a function which can called invoke the method directly. Calling the method will invoke the method level authorization if applied.

<details>
  <summary>Example</summary>

```typescript
import { Type, WebService } from '@sidewinder/server'

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

const add = service.method('add', (context, a, b) => a + b)

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

const result = await add({ ...service execution context }, 1, 2)

if(result !== 3) throw Error('Unexpected result')
```

</details>

## Classes

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgFQJ5gKYBo4AkIDOMOA6hgEYDKGUAbsAMYZwC+cAZlBCHAOQACBYABMMAd2AA7UVAD0BGrRq8AsACh1s2XAC0e-QcNHjJ02fPHN26nUYYrui0+cvXe9eoYRJROAGFvGCgAQwZ4AF4UdAwAOgDJINCYAAoEdTgMjmgQYJgALj4AKwJvXix0zIU6GgK0tUyGvmDhYV4CtEwYgDEAV0kw4G9kgG0O2IA5HpByGmSAShwxmMnp2bmAXUXo5amZqHmFisa+Ah7yNqjO3v6YQckRpZW9+a3Op7XNy4ndtcP6474IB6ABsLktrgMhqNtu99gsvjtVnDPo8fnC-gC+MJgLQwdsIbcoaikS8EbD5iiYWiDuV-hkWOoWHMPGovD54PEYBgAB4RBEAeXIhQwYVSRzgkmCIAwBQRlCCUgA5i9xVxgRgCO1tgBBKAhVDJJbyqBKg6M5kaNQ8yCwOBSLlQdihZgAGQgisVNEQ4uB7uSMQDwSgis1cGCklQw3WcwKtAgIkZLOt0HgDGBwQIBDgAFlcgALGz0JhwHlc6RZshURR2AA8MGiEHY-kCITCOHrmEbzYSpYAfN66XA2UQoD0wtBkmATbRcswoBhmt5gag4L6PTU4G711A5gPMadMPtOa3iN2ubyLQ0GZaGlowz0YHnoMAAF65O7i4IPp8ml-MSKPsABAxBgSgJMkvBfo+z5-mUcDJGmwAYAkACSwg4POACOPQajAu7hP2dSYoBwFrp6UAxGuEFQT+r5KkOwJIahrQ4IhyEwGhl4AvOMA9FAkiIBKUoyliwRKHBaoagUwyQcIIBSHBvAgBAMi5NAvDrKw4pMiyt7aNK0HCAQ4pgGcjEMGGLRwABeZATEBlPsI1EtHBCGBKWODBDg5D4YRcAkZR7rkYFyq8AwwTAuqwiWa0cwANxwDxfECcEcAANRwOQrBcRkpnkOZcCnFlNl2Q5KkQUVrlsuep5eZlvmCQFZE0CFEHhZFGDRZV8WJRgvH8WGuiZdlJlmYwcBAsC1n+bZwFlU5SkglV7m8p53kNUgTVBS1VFhRFUUTUtPVJQNqUAFTDTpg55QV2K0NNAXzRBd3LT2q1hut1l+Vt26tXtHXRS9x19clg3aFlV3Xg4bgw7DsMOPgRDQ3DKOo6YLLDvAOSPtNkjiDm+aFnYqSru6BT+oGwahuGkbRl9Q7eCU6qtUGIa7ldmNwE+viRHjYh4IQKQWtzMAxD0CgQbI2N5nB0vC4LlFAWWyQAKwAAwa3MQA)

Sidewinder supports class based programming and allows one to extend WebService and WebSocketService service types. The following pattern is recommended for developing services with JavaScript classes.

<details>
  <summary>Example</summary>

```typescript
import { Type, Host, WebService } from '@sidewinder/server'

// -------------------------------------------------------------------------
// Service
// -------------------------------------------------------------------------

const Contract = Type.Contract({
  format: 'json',
  server: {
    add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
  },
})

const Context = Type.Object({
  name: Type.String(),
  roles: Type.Array(Type.String()),
})

export interface Logger {
  log(...args: any[]): void
}

export class MathService extends WebService<typeof Contract, typeof Context> {
  constructor(private readonly logger: Logger) {
    super(Contract, Context)
  }

  // authorization
  authorize = this.event('authorize', (clientId, request) => {
    this.logger.log('authorizing clientId', clientId)
    return { name: 'dave', roles: ['admin', 'moderator'] }
  })

  // methods
  public add = this.method('add', (context, a, b) => {
    this.logger.log('called add')
    return a + b
  })
  public sub = this.method('sub', (context, a, b) => {
    this.logger.log('called sub')
    return a - b
  })
  public mul = this.method('mul', (context, a, b) => {
    this.logger.log('called mul')
    return a * b
  })
  public div = this.method('div', (context, a, b) => {
    this.logger.log('called div')
    return a / b
  })
}

// -------------------------------------------------------------------------
// Host
// -------------------------------------------------------------------------

const math = new MathService({ log: (...args: any[]) => console.log(args) })
const host = new Host()
host.use('/math', math)
host.listen(5000)
```

</details>
