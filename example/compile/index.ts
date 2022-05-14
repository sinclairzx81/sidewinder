import { Type, Static } from '@sidewinder/type'


import * as Types from '@sidewinder/type'

export namespace Compiler {
    const referenceMap   = new Map<string, Types.TSchema>()
    const functionMap    = new Map<Types.TSchema, (value: any) => boolean>()
    const functionLocals = [] as string[]

    // -------------------------------------------------------------------
    // Locals
    // -------------------------------------------------------------------

    function ClearLocals() {
        while(functionLocals.length > 0) functionLocals.shift()
    }

    function SetLocal(code: string) {
        const local = `local${functionLocals.length}`
        functionLocals.push(code.replace('local', local))
        return local
    }

    function GetLocals() {
        return functionLocals.join('\n')
    }

    // -------------------------------------------------------------------
    // Expressions
    // -------------------------------------------------------------------
    
    function* Any(schema: Types.TAny, path: string): Generator<string> {
    }

    function* Array(schema: Types.TArray, path: string): Generator<string> {
        const expr = [...Visit(schema.items, `value`)].join(' && ')
        yield `(globalThis.Array.isArray(${path}) && ${path}.every(value => ${expr}))`
    }

    function* Boolean(schema: Types.TBoolean, path: string): Generator<string> {
        yield `(typeof ${path} === 'boolean')`
    }

    function* Constructor(schema: Types.TConstructor, path: string): Generator<string> {
        yield* Visit(schema.yields, path)
    }

    function* Enum(schema: Types.TEnum<any>, path: string): Generator<string> {
        yield ``
    }

    function* Function(schema: Types.TFunction, path: string): Generator<string> {
        yield `(typeof ${path} === 'function')`
    }

    function* Integer(schema: Types.TNumeric, path: string): Generator<string> {
        yield `(typeof ${path} === 'number' && globalThis.Number.isInteger(${path}))`
    }

    function* Intersect(schema: Types.TIntersect, path: string): Generator<string> {
        yield* Object(schema, path)
    }

    function* Literal(schema: Types.TLiteral, path: string): Generator<string> {
        yield `${schema.const} === ${path}`
    }

    function* Null(schema: Types.TNull, path: string): Generator<string> {
        yield `(${path} === null)`
    }

    function* Number(schema: Types.TNumeric, path: string): Generator<string> {
        yield `(typeof ${path} === 'number')`
    }

    function* Object(schema: Types.TObject, path: string): Generator<string> {
        yield `(typeof ${path} === 'object' && ${path} !== null)`
        const propertyKeys = globalThis.Object.keys(schema.properties)
        if (schema.additionalProperties === false) {
            // optimization: If the property key length matches the required keys length
            // then we only need check that the values property key length matches that
            // of the property key length. This is because exhaustive testing for values 
            // will occur in subsequent property tests.
            if(schema.required && schema.required.length === propertyKeys.length) {
                yield `(globalThis.Object.keys(${path}).length === ${propertyKeys.length})`
            } 
            // exhaustive: In cases where optional properties exist, then we must perform
            // an exhaustive check on the values property keys. This operation is O(n^2).
            else {
                const set = `[${propertyKeys.map(key => `'${key}'`).join(', ')}]`
                yield `(globalThis.Object.keys(${path}).every(key => ${set}.includes(key)))`
            }
        }
        for (const propertyKey of propertyKeys) {
            const propertySchema = schema.properties[propertyKey]
            if (schema.required && schema.required.includes(propertyKey)) {
                yield* Visit(propertySchema, `${path}.${propertyKey}`)
            } else {
                const expr = [...Visit(propertySchema, `${path}.${propertyKey}`)].join(' && ')
                yield `${path}.${propertyKey} === undefined ? true : (${expr})`
            }
        }
    }

    function* Promise(schema: Types.TPromise<any>, path: string): Generator<string> {
        yield `(typeof value === 'object' && typeof ${path}.then === 'function')`
    }

    function* Record(schema: Types.TRecord<any, any>, path: string): Generator<string> {
        // if (typeof value !== 'object' || value === null) yield false
        // const propertySchema = globalThis.Object.values(schema.patternProperties)[0]
        // for (const key of globalThis.Object.keys(value)) {
        //   const propertyValue = value[key]
        //   if (!Visit(propertySchema, propertyValue)) yield false
        // }
        // yield true
        yield ``
    }

    function* Rec(schema: Types.TRec<any>, path: string): Generator<string> {
        throw new Error('Cannot typeof recursive types')
    }

    function* Ref(schema: Types.TRef<any>, path: string): Generator<string> {
        throw new Error('Cannot typeof reference types')
    }

    function* Self(schema: Types.TSelf, path: string): Generator<string> {
        // if (!referenceMap.has(schema.$ref)) throw new Error(`Check: Cannot locate schema with $id '${schema.$id}' for referenced type`)
        // const referenced = referenceMap.get(schema.$ref)!
        // yield Visit(referenced, value)
        yield ``
    }

    function* String(schema: Types.TString, path: string): Generator<string> {
        yield `(typeof ${path} === 'string')`
        if(schema.pattern === undefined) return
        if (schema.pattern !== undefined) {
            const local = SetLocal(`const local = new RegExp('${schema.pattern}');`)
            yield `(${path}.match(${local}) !== null)`   
        }
    }

    function* Tuple(schema: Types.TTuple<any[]>, path: string): Generator<string> {
        // if (typeof value !== 'object' || !globalThis.Array.isArray(value)) yield false
        // if (schema.items === undefined && value.length === 0) yield true
        // if (schema.items === undefined) yield false
        // if (value.length < schema.minItems || value.length > schema.maxItems) yield false
        // for (let i = 0; i < schema.items.length; i++) {
        //   if (!Visit(schema.items[i], value[i])) yield false
        // }
        // yield true
        yield ``
    }

    function* Undefined(schema: Types.TUndefined, path: string): Generator<string> {
        yield `${path} === undefined`
    }

    function* Union(schema: Types.TUnion<any[]>, path: string): Generator<string> {
        const exprs = schema.anyOf.map(schema => [...Visit(schema, path)].join(' && '))
        yield `(${exprs.join(' || ')})`
    }

    function* Uint8Array(schema: Types.TUint8Array, path: string): Generator<string> {
        yield `${path} instanceof globalThis.Uint8Array`
    }

    function* Unknown(schema: Types.TUnknown, path: string): Generator<string> {
    }

    function* Void(schema: Types.TVoid, path: string): Generator<string> {
        yield `${path} === null`
    }

    export function* Visit<T extends Types.TSchema>(schema: T, path: string): Generator<string> {
        if (schema.$id !== undefined) referenceMap.set(schema.$id, schema)
        const anySchema = schema as any
        switch (anySchema[Types.Kind]) {
            case 'Any':
                return yield* Any(anySchema, path)
            case 'Array':
                return yield* Array(anySchema, path)
            case 'Boolean':
                return yield* Boolean(anySchema, path)
            case 'Constructor':
                return yield* Constructor(anySchema, path)
            case 'Enum':
                return yield* Enum(anySchema, path)
            case 'Function':
                return yield* Function(anySchema, path)
            case 'Integer':
                return yield* Integer(anySchema, path)
            case 'Intersect':
                return yield* Intersect(anySchema, path)
            case 'Literal':
                return yield* Literal(anySchema, path)
            case 'Null':
                return yield* Null(anySchema, path)
            case 'Number':
                return yield* Number(anySchema, path)
            case 'Object':
                return yield* Object(anySchema, path)
            case 'Promise':
                return yield* Promise(anySchema, path)
            case 'Record':
                return yield* Record(anySchema, path)
            case 'Rec':
                return yield* Rec(anySchema, path)
            case 'Ref':
                return yield* Ref(anySchema, path)
            case 'Self':
                return yield* Self(anySchema, path)
            case 'String':
                return yield* String(anySchema, path)
            case 'Tuple':
                return yield* Tuple(anySchema, path)
            case 'Undefined':
                return yield* Undefined(anySchema, path)
            case 'Union':
                return yield* Union(anySchema, path)
            case 'Uint8Array':
                return yield* Uint8Array(anySchema, path)
            case 'Unknown':
                return yield* Unknown(anySchema, path)
            case 'Void':
                return yield* Void(anySchema, path)
            default:
                throw Error(`Unknown schema kind '${schema[Types.Kind]}'`)
        }
    }

    export function Linear<T extends Types.TSchema>(schema: T) {
        ClearLocals()
        return  [...Visit(schema, 'value')]
    }

    /** Compiles this schema to an expression */
    export function Expr<T extends Types.TSchema>(schema: T): string {
        ClearLocals()
        return [...Visit(schema, 'value')].join(' && ')
    }

    /** Compiles this schema validation function */
    export function Func<T extends Types.TSchema>(schema: T): (value: any) => boolean {
        ClearLocals()
        const expr = [...Visit(schema, 'value')].map(expr => `    ${expr}`).join(' && \n')
        const locals = GetLocals()
        const body = `${locals}\nreturn (function Check(value) {\n  return (\n${expr}\n  )\n})(value)`
        return new globalThis.Function('value', body) as any
    }

    /** Checks if the value is of the given type */
    export function Check<T extends Types.TSchema>(schema: T, value: unknown): value is Static<typeof T> {
        if (!functionMap.has(schema)) functionMap.set(schema, Func(schema))
        return functionMap.get(schema)!(value)
    }
}


// function * test(path: string) {
//     const x = typeof value.x === 'number' &&
//     typeof value.y === 'number' &&
//     typeof value.z === 'number'
// }

const T = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number(),
    i: Type.Array(Type.Number()),
    u: Type.Union([
        Type.String(),
        Type.Number(),
        Type.Object({
            x: Type.Number(),
            y: Type.Number(),
            z: Type.Number(),
        })
    ])
})

console.log(Compiler.Func(Type.Object({
    x: Type.String({ pattern: '123' }),
    y: Type.String({ pattern: '321' }),
    z: Type.Object({
        x: Type.Number(),
        y: Type.Number(),
        z: Type.Number(),
        i: Type.Array(Type.Number()),
        u: Type.Array(Type.Union([
            Type.String(),
            Type.Number(),
            Type.Object({
                x: Type.Number(),
                y: Type.Number(),
                z: Type.Number(),
            })
        ]))
    })
})).toString())


// for (let i = 0; i < 20_000_000; i++) {
//     const value = { x: 1, y: 2, z: 3 }
//     const x = Compiler.Check(T, value)
// }
// // console.log(z)