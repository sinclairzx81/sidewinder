import { TSchema, TArray, TBoolean, TNumber, TObject, TString, Type, TAny, TConstructor, TContract, TEnum, TFunction, TInteger, TIntersect, TKeyOf, TLiteral, TNamespace, TNull, TRecord, TRec, TTuple, TUndefined, TUnion, TUint8Array, TUnknown, TVoid, TPromise, TRef, TRegEx } from '@sidewinder/contract'

export class DefaultBuilder {

    private Any(schema: TAny): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return {}
        }
    }

    private Array(schema: TArray): unknown[] {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.minItems !== undefined) {
            
            return Array.from({ length: schema.minItems }).map(item => this.Create(schema.items))
        } else {
            return []
        }
    }
    
    private Boolean(schema: TBoolean): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return false
        }
    }

    private Constructor(schema: TConstructor): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('Constructor types require a default value')
        }
    }

    private Contract(schema: TContract): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('Contract types require a default value')
        }
    }

    private Enum(schema: TEnum<any>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.anyOf.length === 0) {
            throw new Error('Cannot generate Enum with no set')
        } else {
            return schema.anyOf[0].const
        }
    }

    private Function(schema: TFunction): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('Function types require a default value')
        }
    }

    private Integer(schema: TInteger): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.minimum) {
            return Math.floor(schema.minimum)
        } else {
            return 0
        }
    }

    private Intersect(schema: TIntersect): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            const objects = schema.allOf.map(schema => this.Create(schema))
            return objects.reduce((acc: any, object: any) => {
                return {...acc, ...object }
            }, {}) 
        }
    }

    private KeyOf(schema: TKeyOf<any>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return ((schema.enum) as any)[0]
        }
    }
    
    private Literal(schema: TLiteral): unknown {
        return schema.const
    }

    private Namespace(schema: TNamespace): unknown {
        if(schema.default === undefined) {
            return schema.default
        } else {
            throw new Error('Namespace types require a default value')
        }
    }

    private Null(schema: TNull): null {
        return null
    }
    
    private Number(schema: TNumber): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.minimum !== undefined) {
            return schema.minimum
        } else {
            return 0
        }
    }
    
    private Object(schema: TObject): object {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return schema.default || Object.entries(schema.properties).reduce((acc, [key, schema]) => {
                return {...acc, [key]: this.Create(schema)}
            }, {})
        }
    }

    private Promise(schema: TSchema) {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return Promise.resolve(this.Create(schema))
        }
    }

    private Record(schema: TRecord<any, any>): object {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return {}
        }
    }

    private Rec(schema: TRec<any>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('Rec types require a default value')
        }
    }

    private Ref(schema: TRef<any>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('Ref types require a default value')
        }
    }

    private RegEx(schema: TRegEx): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            throw new Error('RegEx types require a default value')
        }
    }

    private String(schema: TString): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return ''
        }
    }

    private Tuple(schema: TTuple<any[]>): unknown[] {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return Array.from({ length: schema.minItems }).map(schema => this.Create(schema as TSchema))
        }
    }

    private Undefined(schema: TUndefined): undefined {
        return undefined
    }

    private Union(schema: TUnion<any[]>): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.anyOf.length === 0) {
             throw Error('Cannot generate Union with empty set')
        } else {
            return this.Create(schema.anyOf[0])
        }
    }

    private Uint8Array(schema: TUint8Array): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else if(schema.minByteLength) {
            return new Uint8Array(schema.minByteLength)
        } else {
            return new Uint8Array(0)
        }
    }

    private Unknown(schema: TUnknown): unknown {
        if(schema.default !== undefined) {
            return schema.default
        } else {
            return {}
        }
    }

    private Void(schema: TVoid): null {
        return null
    }

    /** Creates a default object that conforms to the given schema */
    public Create<T extends TSchema>(schema: any): T['$static'] {
        console.log('----------------------')
        console.log(schema)
        switch(schema.kind) {
            case 'Any': return this.Any(schema as TAny)
            case 'Array': return this.Array(schema as TArray)
            case 'Boolean': return this.Boolean(schema as TBoolean)
            case 'Constructor': return this.Constructor(schema as TConstructor)
            case 'Contract': return this.Contract(schema as TContract)
            case 'Enum': return this.Enum(schema as TEnum<any>)
            case 'Function': return this.Function(schema as TFunction)
            case 'Intersect': return this.Intersect(schema as TIntersect)
            case 'KeyOf': return this.KeyOf(schema as TKeyOf<any>)
            case 'Literal': return this.Literal(schema as TLiteral)
            case 'Namespace': return this.Namespace(schema as TNamespace)
            case 'Null': return this.Null(schema as TNull)
            case 'Number': return this.Number(schema as TNumber)
            case 'Object': return this.Object(schema as TObject)
            case 'Promise': return this.Promise(schema as TPromise<any>)
            case 'Record': return this.Record(schema as TRecord<any, any>)
            case 'Rec': return this.Rec(schema as TRec<any>)
            case 'Ref': return this.Ref(schema as TRef<any>)
            case 'RegEx': return this.RegEx(schema as TRegEx)
            case 'String': return this.String(schema as TString)
            case 'Tuple': return this.Tuple(schema as TTuple<any[]>)
            case 'Undefined': return this.Undefined(schema as TUndefined)
            case 'Union': return this.Union(schema as TUnion<any[]>)
            case 'Uint8Array': return this.Uint8Array(schema as TUint8Array)
            case 'Unknown': return this.Unknown(schema as TUnknown)
            case 'Void': return this.Void(schema as TVoid)
            default: throw Error(`Unknown schema kind '${schema.kind}'`)
        }
    }
}

export const Default = new DefaultBuilder()