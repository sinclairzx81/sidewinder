import { Type } from '@sidewinder/type'
import * as Types from '@sidewinder/type'

// -----------------------------------------------------
// Compiler Function
// -----------------------------------------------------

export interface DebugAssertOk {
    ok: true
}

export interface DebugAssertFail {
    ok: false
    expr: string
    path: string
    kind: string
    schema: Types.TSchema
}

export type DebugAssertFunction = (value: unknown) => DebugAssertOk | DebugAssertFail
export type ReleaseAssertFunction<T> = (value: unknown) => value is T

export namespace TypeCompiler {
    
    // -------------------------------------------------------------------
    // Condition
    // -------------------------------------------------------------------

    export interface Condition {
        schema: Types.TSchema
        expr: string
        path: string
    }

    function CreateCondition<T extends Types.TSchema>(schema: T, path: string, expr: string): Condition {
        return { schema, path, expr }
    }

    // -------------------------------------------------------------------
    // Schemas
    // -------------------------------------------------------------------

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
        const func = CreateFunctionName(schema.$ref)
        yield CreateCondition(schema, path, `(${func}(${path}).ok)`)
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
         if (schema.$id && !functionNames.has(schema.$id)) {
            functionNames.add(schema.$id)
            const name = CreateFunctionName(schema.$id)
            const body = CreateFunction(schema, 'value', name)
            SetLocal(body)
            yield CreateCondition(schema, path, `(${name}(${path}).ok)`)
            return
        }
        
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

    const functionLocals = new Set<string>()
    const functionNames = new Set<string>()

    function ClearLocals() {
        functionLocals.clear()
        functionNames.clear()
    }

    function SetLocal(code: string) {
        const name = `local${functionLocals.size}`
        functionLocals.add(code.replace('local', name))
        return name
    }

    function GetLocals() {
        return [...functionLocals].join('\n')
    }

    // -------------------------------------------------------------------
    // Functions
    // -------------------------------------------------------------------
    
    function CreateFunctionName($id: string) {
        return `check_${$id.replace(/-/g, '_')}`
    }

    function CreateFunction(schema: Types.TSchema, path: string, name: string) {
        const conditions = [...Visit(schema, path)]
        const statements = conditions.map((condition, index) => `  if(!${condition.expr}) { return { ok: false,  path: '${condition.path}', schema: schemas[${index}], data: ${condition.path} } }`)
        return `function ${name}(value) {\n${statements.join('\n')}\n  return { ok: true }\n}`
    }

    // -------------------------------------------------------------------
    // Compiler
    // -------------------------------------------------------------------

    /** Returns the validation kernel as a string. This function is primarily used for debugging. */
    export function Kernel<T extends Types.TSchema>(schema: T): string {
        ClearLocals()
        const _ = [...Visit(schema, 'value')] // locals populated during yield
        const locals = GetLocals()
        return `${locals}\n return ${CreateFunction(schema, 'value', 'check')}`
    }

    /** Compiles a type into validation function */
    export function Compile<T extends Types.TSchema>(schema: T): DebugAssertFunction {
        ClearLocals()
        const schemas = [...Visit(schema, 'value')].map(condition => condition.schema)
        const locals = GetLocals()
        const body = `${locals}\n return ${CreateFunction(schema, 'value', 'check')}`
        const func = globalThis.Function('schemas', body)
        return func(schemas)
    }
}


// function * test(path: string) {
//     const x = typeof value.x === 'number' &&
//     typeof value.y === 'number' &&
//     typeof value.z === 'number'
// }

// enum Foo {
//     A, B
// }

// const T = Type.Object({
//     number: Type.Number(),
//     negNumber: Type.Number(),
//     maxNumber: Type.Number(),
//     string: Type.String({ default: 'hello' }),
//     longString: Type.String(),
//     boolean: Type.Boolean(),
//     deeplyNested: Type.Object({
//         foo: Type.String(),
//         num: Type.Number(),
//         bool: Type.Boolean()
//     })
// })

const T = Type.Object({
    node: Type.Rec(Node => Type.Object({
        id: Type.String(),
        item: Type.Object({
            nodes: Type.Array(Node)
        })
    }))
})

const I = {
    node: {
        id: 'nodeA',
        item: {
            nodes: [{
                id: 'nodeA',
                item: {
                    nodes: []
                }
            }]
        }
    }
} 

// console.log(T)
// console.log(I)

console.log(TypeCompiler.Kernel(T))
const Check = TypeCompiler.Compile(T)
const Result = Check(I)
console.log(JSON.stringify(Result, null, 2))


// function check_type_0(value: any) {
//     if (!(typeof value === 'object' && value !== null)) { return { ok: false, path: 'value', data: value } }
//     if (!(typeof value.id === 'string')) { return { ok: false, path: 'value.id', data: value.id } }
//     if (!(Array.isArray(value.nodes) && value.nodes.every((value: any) => (check_type_0(value).ok)))) { return { ok: false, path: 'value.nodes', data: value.nodes } }
//     return { ok: true }
// }

// function check(value: any) {
//     if (!(typeof value === 'object' && value !== null)) { return { ok: false, path: 'value', data: value } }
//     const result0 = check_type_0(value.node)
//     if (!result0.ok) { return result0 }
//     return { ok: true }
// }

// const A = check({
//     node: {
//         id: 'nodeA',
//         nodes: [{
//             id: 'nodeB',
//             nodes: [{
//                 id: 'nodeB',
//                 nodes: [1]
//             }]
//         }, {
//             id: 'nodeC',
//             nodes: []
//         }]
//     }
// })

// console.log(A)