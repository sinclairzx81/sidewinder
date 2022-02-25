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

import { Descriptor } from '../descriptors/descriptors'

/** Resolves command line variables */
export class ArgumentsResolver {

    constructor(private readonly argv: string[]) { }

    private has(name: string) {
        const index = this.argv.indexOf(name)
        return (index !== -1)
    }

    private string(name: string) {
        if(!this.has(name)) return undefined
        const index = this.argv.indexOf(name) + 1
        if (!(index < this.argv.length)) return undefined
        const value = this.argv[index].toString()
        if (value.indexOf('--') === 0) return undefined
        return value
    }

    private number(name: string) {
        if(!this.has(name)) return undefined
        const index = this.argv.indexOf(name) + 1
        if (!(index < this.argv.length)) return undefined
        const value = this.argv[index]
        return parseFloat(value)
    }
    
    private integer(name: string) {
        if(!this.has(name)) return undefined
        const index = this.argv.indexOf(name) + 1
        if (!(index < this.argv.length)) return undefined
        const value = this.argv[index]
        return parseInt(value)
    }

    private boolean(name: string) {
        if(!this.has(name)) return undefined
        const index = this.argv.indexOf(name) + 1
        if (!(index < this.argv.length)) return true
        const value = this.argv[index].toString()
        if (value.indexOf('--') === 0) return true
        const test = value.toLowerCase()
        if (test === 'true') return true
        if (test === 'false') return false
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