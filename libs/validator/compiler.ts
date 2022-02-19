/*--------------------------------------------------------------------------

@sidewinder/validator

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

import Ajv, { ErrorObject, ValidateFunction } from 'ajv/dist/2019'
import { TSchema, Static, TUint8Array }       from '@sidewinder/type'
import addFormats                             from 'ajv-formats'
export { ValidateFunction }                   from 'ajv'

/** Sidewinder Schema Compiler */
export namespace Compiler {

    /** Validates for UInt8Array types. */
    function validateUint8Array(data: any, parentSchema: any) {
        const schema = parentSchema       as TUint8Array
        const facade = validateUint8Array as any
        if(!(data instanceof Uint8Array)) {
            const message = `object is not of type Uint8Array`
            facade.errors = [{keyword: 'object', class: 'Uint8Array', message, params: {}}];
            return false
        }
        if(schema.maxByteLength && data.length > schema.maxByteLength) {
            const message = `maxByteLength is ${schema.maxByteLength} but received ${data.length}`
            facade.errors = [{keyword: 'object', class: 'Uint8Array', message, params: {}}];
            return false
        }
        if(schema.minByteLength && data.length < schema.minByteLength) {
            const message = `minByteLength is ${schema.minByteLength} but received ${data.length}`
            facade.errors = [{keyword: 'object', class: 'Uint8Array', message, params: {}}];
            return false
        }
        return true
    }

    /** Validates for undefined. */
    function validateUndefined(data: any, parentSchema: any) {
        return data === undefined
    }

    function validateSpecialized(specializedType: string, data: any, parentSchema: any) {
        switch(specializedType) {
            case 'Uint8Array': return validateUint8Array(data, parentSchema)
            case 'Undefined': return validateUndefined(data, parentSchema)
            default: return false
        }
    }

    const ajv = addFormats(new Ajv({}), [ 
        'date-time', 'time', 'date', 'email', 'hostname', 'ipv4', 
        'ipv6', 'uri', 'uri-reference', 'uuid', 'uri-template', 
        'json-pointer', 'relative-json-pointer', 'regex'
    ])
    .addKeyword({ keyword: 'specialized', type: 'object', validate: validateSpecialized })
    .addKeyword('maxByteLength')
    .addKeyword('minByteLength')
    .addKeyword('modifier')
    .addKeyword('kind')
    
    /** Formats errors given by the ValidateFunction on validation fail. */
    export function errorsText(errors: ErrorObject[]) {
        return ajv.errorsText(errors)
    }

    /** Adds the given schemas to the compiler */
    export function addSchema(schemas: TSchema[]) {
        ajv.addSchema(schemas)
    }

    /** Compiles the given schema and returns a validate function. */
    export function compile<T extends TSchema>(schema: T): ValidateFunction<Static<T>> {
        return ajv.compile(schema)
    }
}