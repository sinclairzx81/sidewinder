/*--------------------------------------------------------------------------

@sidewinder/config

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

import { Descriptor } from "../descriptors/descriptors"

export class EnvironmentResolver {
    constructor(private readonly env: object) { }

    private string(name: string) {
        if(this.env[name] === undefined) return undefined
        return this.env[name].toString()
    }

    private number(name: string) {
        if(this.env[name] === undefined) return undefined
        return parseFloat(this.env[name].toString())
    }

    private integer(name: string) {
        if(this.env[name] === undefined) return undefined
        return parseInt(this.env[name].toString())
    }

    private boolean(name: string) {
        if(this.env[name] === undefined) return undefined
        const value = this.env[name].toString().toLowerCase()
        if(value === 'true') return true
        if(value === 'false') return false
        return true
    }

    public resolve(descriptor: Descriptor): unknown {
        if (descriptor.type === 'string') {
            return this.string(descriptor.name)
        } else if (descriptor.type === 'number') {
            return this.number(descriptor.name)
        } else if (descriptor.type === 'integer') {
            return this.integer(descriptor.name)
        } else if (descriptor.type === 'boolean') {
            return this.boolean(descriptor.name)
        } else { 
            return undefined
        }
    }
}