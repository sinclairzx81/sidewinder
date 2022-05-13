/*--------------------------------------------------------------------------

@sidewinder/server

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { IncomingMessage, ServerResponse } from 'http'
import { RestMiddleware, RestMiddlewareFunction, RestMiddlewareNextFunction } from './middleware'
import { HttpService } from '../http/http'
import { RestRequest } from './request'
import { RestResponse } from './response'
import { Pattern } from './pattern'

export type RestMiddlewareVariant = RestMiddleware | RestMiddlewareFunction
export type RestServiceErrorCallback = (clientId: string, error: unknown) => Promise<void> | void
export type RestCallback = (request: RestRequest, response: RestResponse) => void

export type RestRoute = {
  method: string
  pattern: Pattern
  middleware: RestMiddleware[]
  callback: RestCallback
}

export class RestService extends HttpService {
  private onErrorCallback: RestServiceErrorCallback
  private readonly middleware: RestMiddleware[]
  private readonly routes: RestRoute[]
  constructor() {
    super()
    this.onErrorCallback = () => {}
    this.middleware = []
    this.routes = []
  }

  /** Subscribes to error events. */
  public event(event: 'error', callback: RestServiceErrorCallback): RestServiceErrorCallback

  /** Subscribes to events */
  public event(event: string, callback: (...args: any[]) => any): any {
    switch (event) {
      case 'error': {
        this.onErrorCallback = callback
        break
      }
      default:
        throw Error(`Unknown event '${event}'`)
    }
    return callback
  }

  /** Creates a middleware function which is executed on all routes. */
  public use(middleware: RestMiddlewareVariant): this
  public use(middleware: any) {
    this.middleware.push(this.normalizeMiddleware(middleware))
    return this
  }

  /** Creates a http `get` route */
  public get(pattern: string, middleware: RestMiddlewareVariant[], callback: RestCallback): this
  /** Creates a http `get` route */
  public get(pattern: string, callback: RestCallback): this
  public get(...args: any[]) {
    return this.createRoute(...(['get', ...args] as [string, string, RestMiddleware[], RestCallback]))
  }

  /** Creates a http `delete` route */
  public delete(pattern: string, middleware: RestMiddlewareVariant[], handler: RestCallback): this
  /** Creates a http `delete` route */
  public delete(pattern: string, callback: RestCallback): this
  public delete(...args: any[]) {
    return this.createRoute(...(['delete', ...args] as [string, string, RestMiddleware[], RestCallback]))
  }

  /** Creates a http `patch` route */
  public patch(pattern: string, middleware: RestMiddlewareVariant[], handler: RestCallback): this
  /** Creates a http `patch` route */
  public patch(pattern: string, callback: RestCallback): this
  public patch(...args: any[]) {
    return this.createRoute(...(['patch', ...args] as [string, string, RestMiddleware[], RestCallback]))
  }

  /** Creates a http `post` route */
  public post(pattern: string, middleware: RestMiddlewareVariant[], handler: RestCallback): this
  /** Creates a http `post` route */
  public post(pattern: string, callback: RestCallback): this
  public post(...args: any[]) {
    return this.createRoute(...(['post', ...args] as [string, string, RestMiddleware[], RestCallback]))
  }

  /** Creates a http `put` route */
  public put(pattern: string, middleware: RestMiddlewareVariant[], handler: RestCallback): this
  /** Creates a http `put` route */
  public put(pattern: string, callback: RestCallback): this
  public put(...args: any[]) {
    return this.createRoute(...(['put', ...args] as [string, string, RestMiddleware[], RestCallback]))
  }

  /** Creates a route */
  private createRoute(...args: any[]): this {
    this.routes.push(
      args.length === 4
        ? {
            method: args[0] as string,
            pattern: new Pattern(args[1] as string),
            middleware: args[2].map((middleware: RestMiddleware) => this.normalizeMiddleware(middleware)),
            callback: args[3] as RestCallback,
          }
        : {
            method: args[0] as string,
            pattern: new Pattern(args[1] as string),
            middleware: [] as RestMiddleware[],
            callback: args[2] as RestCallback,
          },
    )
    return this
  }

  /** Accepts an incoming HTTP request and processes it as Rest method call. This method is called automatically by the Host. */
  public async accept(clientId: string, req: IncomingMessage, res: ServerResponse) {
    this.handler(clientId, req, res, async (_, restResponse) => {
      restResponse.status(404)
      restResponse.headers({ 'Content-Type': 'text/plain' })
      await restResponse.text('Not found')
    })
  }
  
  /** Handles an incoming HTTP request. If the request was unhandled it is deferred to the `next` handler. */
  private handler(clientId: string, request: IncomingMessage, response: ServerResponse, next: RestMiddlewareNextFunction) {
    // Resolve route from request and defer to 'next' if the route cannot be found.
    const resolved = this.resolveRoute(request)
    if (resolved === undefined) return next(new RestRequest(request, {}, clientId), new RestResponse(response))
    // Execute middleware and route
    const [route, params] = resolved
    const restRequest = new RestRequest(request, params, clientId)
    const restResponse = new RestResponse(response)
    this.executeRoute([...this.middleware, ...route.middleware], restRequest, restResponse, async (requestRequest, restResponse) => {
      try {
        await route.callback(requestRequest, restResponse)
      } catch (error) {
        this.onErrorCallback(clientId, error)
        await restResponse.status(500).text('Internal Server Error')
      }
    })
  }

  private resolveRoute(request: IncomingMessage): [RestRoute, Record<string, string>] | undefined {
    const [url, method] = [request.url || '/', request.method || 'get']
    const { pathname } = new URL(url, 'http://localhost')
    for (const route of this.routes) {
      if (route.method !== method.toLocaleLowerCase()) continue
      const params = route.pattern.match(pathname)
      if (!params) continue
      if (route.pattern.match(pathname)) return [route, params]
    }
    return undefined
  }

  private executeRoute(middleware: RestMiddleware[], request: RestRequest, response: RestResponse, next: RestMiddlewareNextFunction) {
    if (middleware.length === 0) return next(request, response)
    middleware.shift()!.callback(request, response, (request, response) => this.executeRoute(middleware, request, response, next))
  }

  /** Middleware functions are remapped middleware types. */
  private normalizeMiddleware(middleware: RestMiddlewareVariant): RestMiddleware {
    return typeof middleware === 'function' ? { callback: middleware } : middleware
  }
}
