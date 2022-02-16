/*--------------------------------------------------------------------------

@sidewinder/mongo

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

import * as Mongo from 'mongodb'
import { Type, TObject } from '@sidewinder/contract'
import { Schema, ValidateFunction } from './schema'

export class EncoderValidationError extends Error {
    constructor(public readonly errors?: any) {
        super('Unable to validate schema')
    }
}

export class Encoder {
    private readonly validateFunction: ValidateFunction
    private readonly validatePartialFunction: ValidateFunction

    constructor(private readonly schema: TObject) {
        this.validateFunction = Schema.compile(this.schema)
        this.validatePartialFunction = Schema.compile(Type.Partial(this.schema))
    }
    
    /** Validates the given JavaScript data against the schema associated with this encoder. */
    public validate(data: any) {
        const result = this.validateFunction(data)
        if(!result) throw new EncoderValidationError(this.validateFunction.errors)
    }

    /** Validates the given JavaScript data against the schema associated with this encoder. */
    public validatePartial(data: any) {
        const result = this.validatePartialFunction(data)
        if(!result) throw new EncoderValidationError(this.validatePartialFunction.errors)
    }

    /** Decodes mongo records to plain JavaScript objects */
    public decode(value: any): any {
        if(value instanceof Mongo.ObjectId) {
            return value.toHexString()
        } else if(value instanceof Mongo.Binary) {
            return new Uint8Array(value.buffer)
        } else if(typeof value === 'object' && !Array.isArray(value)) {
            return Object.entries(value).reduce((acc, [key, value]) => {
                return { ...acc, [key]: this.decode(value) }
            }, {})
        } else if(typeof value === 'object' && Array.isArray(value)) {
            return value.map(item => this.decode(item))
        } else {
            return value
        }
    }

    /** Encodes plain JavaScript objects into Mongo records */
    public encode(value: any): any {
        if(typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) {
            return new Mongo.ObjectId(value)
        } else if(value instanceof Uint8Array) {
            return new Mongo.Binary(Buffer.from(value))
        } else if(typeof value === 'object' && !Array.isArray(value)) {
            return Object.entries(value).reduce((acc, [key, value]) => {
                return { ...acc, [key]: this.encode(value) }
            }, {})
        } else if(typeof value === 'object' && Array.isArray(value)) {
            return value.map(item => this.encode(item))
        } else {
            return value
        }
    }
}
