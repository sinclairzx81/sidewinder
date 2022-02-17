/*--------------------------------------------------------------------------

@sidewinder/types

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

import * as Types from './types'

export class DefaultBuilder {
    private Any(schema: Types.TAny): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return {}
        }
    }

    private Array(schema: Types.TArray): unknown[] {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.minItems !== undefined) {
            
            return Array.from({ length: schema.minItems }).map(item => this.Create(schema.items))
        } else {
            return []
        }
    }
    
    private Boolean(schema: Types.TBoolean): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return false
        }
    }

    private Constructor(schema: Types.TConstructor): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('Constructor types require a default value')
        }
    }

    private Enum(schema: Types.TEnum<any>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.anyOf.length === 0) {
            throw new Error('Cannot generate Enum with no set')
        } else {
            return schema.anyOf[0].const
        }
    }

    private Function(schema: Types.TFunction): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return () => {}
        }
    }

    private Integer(schema: Types.TInteger): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.minimum) {
            return Math.floor(schema.minimum)
        } else {
            return 0
        }
    }

    private Intersect(schema: Types.TIntersect): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            const objects = schema.allOf.map(schema => this.Create(schema))
            return objects.reduce((acc: any, object: any) => {
                return {...acc, ...object }
            }, {}) 
        }
    }

    private KeyOf(schema: Types.TKeyOf<any>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return ((schema.enum) as any)[0]
        }
    }
    
    private Literal(schema: Types.TLiteral): unknown {
        return schema.const
    }

    private Namespace(schema: Types.TNamespace): unknown {
        if(schema.default === undefined) {
            return schema.default
        } else {
            throw new Error('Namespace types require a default value')
        }
    }

    private Null(schema: Types.TNull): null {
        return null
    }
    
    private Number(schema: Types.TNumber): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.minimum !== undefined) {
            return schema.minimum
        } else {
            return 0
        }
    }
    
    private Object(schema: Types.TObject): object {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return schema.default || Object.entries(schema.properties).reduce((acc, [key, schema]) => {
                return {...acc, [key]: this.Create(schema)}
            }, {})
        }
    }

    private Promise(schema: Types.TSchema) {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return Promise.resolve(this.Create(schema))
        }
    }

    private Record(schema: Types.TRecord<any, any>): object {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return {}
        }
    }

    private Rec(schema: Types.TRec<any>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('Rec types require a default value')
        }
    }

    private Ref(schema: Types.TRef<any>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('Ref types require a default value')
        }
    }

    private RegEx(schema: Types.TRegEx): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('RegEx types require a default value')
        }
    }

    private String(schema: Types.TString): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return ''
        }
    }
    
    private Tuple(schema: Types.TTuple<any[]>): unknown[] {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return Array.from({ length: schema.minItems }).map((_, index) => this.Create((schema.items as any[])[index]))
        }
    }

    private Undefined(schema: Types.TUndefined): undefined {
        return undefined
    }

    private Union(schema: Types.TUnion<any[]>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.anyOf.length === 0) {
             throw Error('Cannot generate Union with empty set')
        } else {
            return this.Create(schema.anyOf[0])
        }
    }

    private Uint8Array(schema: Types.TUint8Array): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.minByteLength) {
            return new Uint8Array(schema.minByteLength)
        } else {
            return new Uint8Array(0)
        }
    }

    private Unknown(schema: Types.TUnknown): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return {}
        }
    }

    private Void(schema: Types.TVoid): null {
        return null
    }

    /** Creates a default object for the given schema */
    public Create<T extends Types.TSchema>(schema: T): Types.Static<T> {
        switch(schema.kind) {
            case 'Any': return this.Any(schema as any)
            case 'Array': return this.Array(schema as any)
            case 'Boolean': return this.Boolean(schema as any)
            case 'Constructor': return this.Constructor(schema as any)
            case 'Enum': return this.Enum(schema as any)
            case 'Function': return this.Function(schema as any)
            case 'Integer': return this.Integer(schema as any)
            case 'Intersect': return this.Intersect(schema as any)
            case 'KeyOf': return this.KeyOf(schema as any)
            case 'Literal': return this.Literal(schema as any)
            case 'Namespace': return this.Namespace(schema as any)
            case 'Null': return this.Null(schema as any)
            case 'Number': return this.Number(schema as any)
            case 'Object': return this.Object(schema as any)
            case 'Promise': return this.Promise(schema as any)
            case 'Record': return this.Record(schema as any)
            case 'Rec': return this.Rec(schema as any)
            case 'Ref': return this.Ref(schema as any)
            case 'RegEx': return this.RegEx(schema as any)
            case 'String': return this.String(schema as any)
            case 'Tuple': return this.Tuple(schema as any)
            case 'Undefined': return this.Undefined(schema as any)
            case 'Union': return this.Union(schema as any)
            case 'Uint8Array': return this.Uint8Array(schema as any)
            case 'Unknown': return this.Unknown(schema as any)
            case 'Void': return this.Void(schema as any)
            default: throw Error(`Unknown schema kind '${schema.kind}'`)
        }
    }
}

/** Generates default values for each type. */
export const Default = new DefaultBuilder()