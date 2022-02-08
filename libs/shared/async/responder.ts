/*--------------------------------------------------------------------------

@sidewinder/shared

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

import { v4 } from 'uuid'

interface Deferred {
    clientId: string
    resolve:  Function
    reject:   Function
}

export class Responder {
    private readonly map: Map<string, Deferred>

    constructor() {
        this.map = new Map<string, Deferred>()
    }

    /** Registers a deferred for the given clientId and returns a handle */
    public register(clientId: string, resolve: Function, reject: Function): string {
        const handle = v4()
        this.map.set(handle, { clientId, resolve, reject })
        return handle
    }
    
    /** Resolves a deferred with the given result */
    public resolve(handle: string, result: unknown) {
        if(!this.map.has(handle)) return
        const deferred = this.map.get(handle)!
        this.map.delete(handle)
        deferred.resolve(result)
    }

    /** Rejects a deferred with the given error */
    public reject(handle: string, error: unknown) {
        if(!this.map.has(handle)) return
        const deferred = this.map.get(handle)!
        this.map.delete(handle)
        deferred.reject(error)
        
    }
    
    /** Rejects all deferreds matching the given clientId */
    public rejectFor(clientId: string, error: unknown) {
        for(const [handle, deferred] of this.map) {
            if(deferred.clientId !== clientId) continue
            deferred.reject(error)
            this.map.delete(handle)
        }
    }
}