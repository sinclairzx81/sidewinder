import { Validator } from '@sidewinder/validator'
import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'

// $id: 'AjvTest',
// $schema: 'http://json-schema.org/draft-07/schema#',
// type: 'object',
// properties: {
//   number: {
//     type: 'number',
//   },
//   negNumber: {
//     type: 'number',
//   },
//   maxNumber: {
//     type: 'number',
//   },
//   string: {
//     type: 'string',
//   },
//   longString: {
//     type: 'string',
//   },
//   boolean: {
//     type: 'boolean',
//   },
//   deeplyNested: {
//     type: 'object',
//     properties: {
//       foo: {
//         type: 'string',
//       },
//       num: {
//         type: 'number',
//       },
//       bool: {
//         type: 'boolean',
//       },
//     },
//     required: ['foo', 'num', 'bool'],
//     additionalProperties: false,
//   },
// },
// required: [
//   'number',
//   'negNumber',
//   'maxNumber',
//   'string',
//   'longString',
//   'boolean',
//   'deeplyNested',
// ],
// additionalProperties: false,

const T = Type.Object({
    number: Type.Number(),
    negNumber: Type.Number(),
    maxNumber: Type.Number(),
    string: Type.String({ default: 'hello'}),
    longString: Type.String({ default: '1111111111111111111111111111111111111111111111111111111111111111111111' }),
    boolean: Type.Boolean(),
    deeplyNested: Type.Object({
        foo: Type.String(),
        num: Type.Number(),
        bool: Type.Boolean()
    })
})

const I = Value.Create(T)
console.log(I, Value.Check(T, I))

function ajv() {
    const validator = new Validator(T)
    const start = Date.now()
    for (let i = 0; i < 1_000_000; i++) {
        validator.check(I)
    }
    return Date.now() - start
}

function value() {
    const start = Date.now()
    for (let i = 0; i < 1_000_000; i++) {
        const x = Value.Check(T, I)
        if (x === false) throw 1
    }
    return Date.now() - start
}

while(true) {
    const a = ajv()
    console.log(a)
    const b = value()
    console.log(b)
    console.log(Math.round((a / b) * 100), '%')
}

// const T = Type.Object({ x: Type.Number(), y: Type.Optional(Type.Number()) })
// console.log(Value.Check(T, { x: 10 }))
