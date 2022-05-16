import { Validator } from '@sidewinder/validator'
import { Value } from '@sidewinder/value'
import { Type, TSchema, TypeCompiler } from '@sidewinder/type'

// ------------------------------------------------------------------------------
// Benchmarks
// ------------------------------------------------------------------------------

function benchmark<T extends TSchema>(name: string, iterations: number, schema: T, data?: unknown) {
    console.log('benchmark:', name)
    const I = data || Value.Create(schema)
    const A = (function () {
        console.log(schema)
        const validator = new Validator(schema)
        const start = Date.now()
        console.log('benchmark:', name, 'ajv profiling')
        for (let i = 0; i < iterations; i++) {
            const result = validator.check(I)
            if (result.success === false) throw 1
        }
        return Date.now() - start
    })();
    const B = (function () {
        const validator = TypeCompiler.Compile(schema)
        const start = Date.now()
        console.log('benchmark:', name, 'val profiling')
        for (let i = 0; i < iterations; i++) {
            const result = validator(I)
            if (result.ok === false) throw 1
        }
        return Date.now() - start
    })();
    console.log('benchmark:', name, 'ajv:', A)
    console.log('benchmark:', name, 'val:', B)
    console.log('benchmark:', name, A / B, 'delta')
}

function start(iterations: number) {

    benchmark('looseAssert', iterations, Type.Object({
        number: Type.Number(),
        negNumber: Type.Number(),
        maxNumber: Type.Number(),
        string: Type.String({ default: 'hello' }),
        longString: Type.String(),
        boolean: Type.Boolean(),
        deeplyNested: Type.Object({
            foo: Type.String(),
            num: Type.Number(),
            bool: Type.Boolean()
        })
    }))

    benchmark('strictAssert', iterations, Type.Object({
        number: Type.Number(),
        negNumber: Type.Number(),
        maxNumber: Type.Number(),
        string: Type.String({ default: 'hello' }),
        longString: Type.String(),
        boolean: Type.Boolean(),
        deeplyNested: Type.Object({
            foo: Type.String(),
            num: Type.Number(),
            bool: Type.Boolean()
        }, { additionalProperties: false })
    }, { additionalProperties: false }))

    benchmark('recursive', iterations, Type.Rec(Node => Type.Object({
        id: Type.String(),
        nodes: Type.Array(Node)
    })), {
        id: '', nodes: [{
            id: '', nodes: [{
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }]
        }, {
            id: '', nodes: [{
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }]
        }, {
            id: '', nodes: [{
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }]
        }, {
            id: '', nodes: [{
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }, {
                id: '', nodes: []
            }]
        }]
    })
}


start(50_000_000)