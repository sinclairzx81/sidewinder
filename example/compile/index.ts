import { Type, Static, TSchema } from '@sidewinder/type'

import * as Types from '@sidewinder/type'

// -----------------------------------------------------
// Compiler Function
// -----------------------------------------------------

export interface DebugAssertOk {
    ok: true
}

export interface DebugAssertFail {
    ok:   false
    expr: string
    path: string
    kind: string
    schema: Types.TSchema
}

export type DebugAssertFunction = (value: unknown) => DebugAssertOk | DebugAssertFail
export type ReleaseAssertFunction<T> = (value: unknown) => value is T

export namespace TypeCompiler {

    // -------------------------------------------------------------------
    // Conditions
    // -------------------------------------------------------------------

    export interface Condition {
        schema: any
        expr: string
        path: string
    }

    function CreateCondition<T extends Types.TSchema>(schema: T, path: string, expr: string): Condition {
        return { schema, path, expr }
    }


    function* Any(schema: Types.TAny, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, '(true)')
    }

    function* Array(schema: Types.TArray, path: string): Generator<Condition> {
        const expr = [...Visit(schema.items, `value`)].map(condition => condition.expr).join(' && ')
        yield CreateCondition(schema, path, `(Array.isArray(${path}) && ${path}.every(value => ${expr}))`)
    }

    function* Boolean(schema: Types.TBoolean, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(typeof ${path} === 'boolean')`)
    }

    function* Constructor(schema: Types.TConstructor, path: string): Generator<Condition> {
        yield* Visit(schema.yields, path)
    }

    function* Function(schema: Types.TFunction, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(typeof ${path} === 'function')`)
    }

    function* Integer(schema: Types.TNumeric, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(typeof ${path} === 'number' && Number.isInteger(${path}))`)
        if (schema.multipleOf) yield CreateCondition(schema, path, `(${path} % ${schema.multipleOf} === 0)`)
        if (schema.exclusiveMinimum) yield CreateCondition(schema, path, `(${path} < ${schema.exclusiveMinimum})`)
        if (schema.exclusiveMaximum) yield CreateCondition(schema, path, `(${path} < ${schema.exclusiveMaximum})`)
        if (schema.minimum) yield CreateCondition(schema, path, `(${path} >= ${schema.minimum})`)
        if (schema.maximum) yield CreateCondition(schema, path, `(${path} <= ${schema.maximum})`)
    }

    function* Literal(schema: Types.TLiteral, path: string): Generator<Condition> {
        if (typeof schema.const === 'string') {
            yield CreateCondition(schema, path, `${path} === '${schema.const}'`)
        } else {
            yield CreateCondition(schema, path, `${path} === ${schema.const}`)
        }
    }

    function* Null(schema: Types.TNull, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(${path} === null)`)
    }

    function* Number(schema: Types.TNumeric, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(typeof ${path} === 'number')`)
        if (schema.multipleOf) yield CreateCondition(schema, path, `(${path} % ${schema.multipleOf} === 0)`)
        if (schema.exclusiveMinimum) yield CreateCondition(schema, path, `(${path} < ${schema.exclusiveMinimum})`)
        if (schema.exclusiveMaximum) yield CreateCondition(schema, path, `(${path} < ${schema.exclusiveMaximum})`)
        if (schema.minimum) yield CreateCondition(schema, path, `(${path} >= ${schema.minimum})`)
        if (schema.maximum) yield CreateCondition(schema, path, `(${path} <= ${schema.maximum})`)
    }

    function* Object(schema: Types.TObject, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(typeof ${path} === 'object' && ${path} !== null)`)
        const propertyKeys = globalThis.Object.keys(schema.properties)
        if (schema.additionalProperties === false) {
            // optimization: If the property key length matches the required keys length
            // then we only need check that the values property key length matches that
            // of the property key length. This is because exhaustive testing for values 
            // will occur in subsequent property tests.
            if (schema.required && schema.required.length === propertyKeys.length) {
                yield CreateCondition(schema, path, `(Object.keys(${path}).length === ${propertyKeys.length})`)
            } else {
                const keys = `[${propertyKeys.map(key => `'${key}'`).join(', ')}]`
                yield CreateCondition(schema, path, `(Object.keys(${path}).every(key => ${keys}.includes(key)))`)
            }
        }
        for (const propertyKey of propertyKeys) {
            const propertySchema = schema.properties[propertyKey]
            if (schema.required && schema.required.includes(propertyKey)) {
                yield* Visit(propertySchema, `${path}.${propertyKey}`)
            } else {
                const expr = [...Visit(propertySchema, `${path}.${propertyKey}`)].join(' && ')
                yield CreateCondition(schema, `${path}.${propertyKey}`, `${path}.${propertyKey} === undefined ? true : (${expr})`)
            }
        }
    }

    function* Promise(schema: Types.TPromise<any>, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(typeof value === 'object' && typeof ${path}.then === 'function')`)
    }

    function* Record(schema: Types.TRecord<any, any>, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(typeof ${path} === 'object' && ${path} !== null)`)
        const [keyPattern, valueSchema] = globalThis.Object.entries(schema.patternProperties)[0]
        // optimization: if passing union literal strings, we can add a forward assertion to
        // check the length of the keys matches that of the number possible union values. This
        // quickly asserts that the value has all required keys before exhaustive checks.
        if (!(keyPattern === '^.*$' || keyPattern === '^(0|[1-9][0-9]*)$')) {
            const propertyKeys = keyPattern.slice(1, keyPattern.length - 1).split('|')
            yield CreateCondition(schema, path, `(Object.keys(${path}).length === ${propertyKeys.length})`)
        }
        const local = SetLocal(`const local = new RegExp(/${keyPattern}/)`)
        yield CreateCondition(schema, path, `(Object.keys(${path}).every(key => ${local}.test(key)))`)
        const expr = [...Visit(valueSchema, 'value')].map(cond => cond.expr).join(' && ')
        yield CreateCondition(schema, path, `(Object.values(${path}).every(value => ${expr}))`)
    }

    function* Ref(schema: Types.TRef<any>, path: string): Generator<Condition> {
        throw new Error('TypeCompiler cannot compile Ref for Ref')
    }

    function* Self(schema: Types.TSelf, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `Check(${path})`)
    }

    function* String(schema: Types.TString, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(typeof ${path} === 'string')`)
        if (schema.pattern !== undefined) {
            const local = SetLocal(`const local = new RegExp('${schema.pattern}');`)
            yield CreateCondition(schema, path, `(${local}.test(${path}))`)
        }
    }

    function* Tuple(schema: Types.TTuple<any[]>, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(Array.isArray(${path}))`)
        if (schema.items === undefined) return yield CreateCondition(schema, path, `(${path}.length === 0)`)
        yield CreateCondition(schema, path, `(${path}.length === ${schema.maxItems})`)
        for (let i = 0; i < schema.items.length; i++) {
            const expr = [...Visit(schema.items[i], `${path}[${i}]`)].map(condition => condition.expr).join(' && ')
            yield CreateCondition(schema, path, expr)
        }
    }

    function* Undefined(schema: Types.TUndefined, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `${path} === undefined`)
    }

    function* Union(schema: Types.TUnion<any[]>, path: string): Generator<Condition> {
        const exprs = schema.anyOf.map(schema => [...Visit(schema, path)].map(cond => cond.expr).join(' && '))
        yield CreateCondition(schema, path, `(${exprs.join(' || ')})`)
    }

    function* Uint8Array(schema: Types.TUint8Array, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `(${path} instanceof Uint8Array)`)
        if (schema.maxByteLength) yield CreateCondition(schema, path, `(${path}.length <= ${schema.maxByteLength})`)
        if (schema.minByteLength) yield CreateCondition(schema, path, `(${path}.length >= ${schema.minByteLength})`)
    }

    function* Unknown(schema: Types.TUnknown, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, '(true)')
    }

    function* Void(schema: Types.TVoid, path: string): Generator<Condition> {
        yield CreateCondition(schema, path, `${path} === null`)
    }

    function* Visit<T extends Types.TSchema>(schema: T, path: string): Generator<Condition> {
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
            case 'Function':
                return yield* Function(anySchema, path)
            case 'Integer':
                return yield* Integer(anySchema, path)
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

    // -------------------------------------------------------------------
    // Locals
    // -------------------------------------------------------------------

    const functionLocals = [] as string[]

    function ClearLocals() {
        while (functionLocals.length > 0) functionLocals.shift()
    }

    function SetLocal(code: string) {
        const name = `local${functionLocals.length}`
        functionLocals.push(code.replace('local', name))
        return name
    }

    function GetLocals() {
        return functionLocals.join('\n')
    }

    // -------------------------------------------------------------------
    // Compiler
    // -------------------------------------------------------------------

     /** Compiles an validation function that includes debug symbol information. */
     export function Debug<T extends Types.TSchema>(schema: T): DebugAssertFunction {
        ClearLocals()
        const conditions = [...Visit(schema, 'value')]
        const schemas    = conditions.map(condition => condition.schema)
        const statements = conditions.map((condition, index) => `if(!${condition.expr}) { return { ok: false,  path: '${condition.path}', schema: schemas[${index}], data: ${condition.path} } }`)
        const locals = GetLocals()
        const body = `${locals}\nreturn function Check(value) {\n${statements.join('\n')}\nreturn true \n}`
        const func = globalThis.Function('schemas', body)
        return func(schemas)
    }

    /** Compiles an optimized validation function that omits and debug information. This function returns true or false only. */
    export function Release<T extends Types.TSchema>(schema: T): ReleaseAssertFunction<Static<T>> {
        ClearLocals()
        const conditions = [...Visit(schema, 'value')].map(expr => `    ${expr.expr}`).join(' && \n')
        const locals = GetLocals()
        const body = `${locals}\nreturn function Check(value) {\n  return (\n${conditions}\n  )\n}`
        const func = globalThis.Function(body)
        return func()
    }
}

// function * test(path: string) {
//     const x = typeof value.x === 'number' &&
//     typeof value.y === 'number' &&
//     typeof value.z === 'number'
// }

enum Foo {
    A, B
}

const T = Type.Object({
    // o: Type.Rec(Self => Type.Object({ a: Type.Number(), x: Type.Array(Self) })),
    // a: Type.Literal(10),
    // b: Type.Literal(false),
    // c: Type.Literal('hello'),
    a: Type.Array(Type.Number()),
    e: Type.Enum(Foo),
    r: Type.Record(Type.Union([
        Type.Literal('A'),
        Type.Literal('B'),
        Type.Literal('C')
    ]), Type.Object({
        a: Type.Number(),
        b: Type.Number()
    })),
    // u: Type.Uint8Array({ minByteLength: 100 }),
    // number: Type.Number({ minimum: 10, maximum: 100, multipleOf: 10 }),
    // tuple: Type.Tuple([Type.Number(), Type.Object({
    //     x: Type.Number(),
    //     y: Type.Number(),
    //     z: Type.Number(),
    // })])
})
console.log(T)
// for (let i = 0; i < 1; i++) {
//     Compiler.Func(T).toString()
// }

console.log('debug', TypeCompiler.Debug(T).toString())
console.log('release', TypeCompiler.Release(T).toString())

const value = {
    e: 3,
    a: [1, 2, 3, true],
    r: {
        'A': { a: 1, b: 2 },
        'B': { a: 1, b: 2 },
        'C': { a: 1, b: 2 }
    }
}
const Check = TypeCompiler.Debug(T)
const Result = Check(value)
console.log(JSON.stringify(Result, null, 2))

