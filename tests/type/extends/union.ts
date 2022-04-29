import { Type, Extends, ExtendsResult } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('type/extends/Union', () => {

    it('Should extend Any', () => {
        type T = number | string extends any ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Any())
        Assert.deepEqual(R, ExtendsResult.True)
    })

    it('Should extend String', () => {
        type T = number | string extends string ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.String())
        Assert.deepEqual(R, ExtendsResult.False)
    })

    it('Should extend Boolean', () => {
        type T = number | string extends boolean ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Boolean())
        Assert.deepEqual(R, ExtendsResult.False)
    })

    it('Should extend Number', () => {
        type T = number | string extends number ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Number())
        Assert.deepEqual(R, ExtendsResult.False)
    })

    it('Should extend Integer', () => {
        type T = number | string extends number ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Integer())
        Assert.deepEqual(R, ExtendsResult.False) // number & integer distinct
    })

    it('Should extend Array', () => {
        type T = number | string extends Array<any> ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Array(Type.Any()))
        Assert.deepEqual(R, ExtendsResult.False)
    })
    it('Should extend Tuple', () => {
        type T = number | string extends [number, number] ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Tuple([Type.Number(), Type.Number()]))
        Assert.deepEqual(R, ExtendsResult.False)
    })
    it('Should extend Object 1', () => {
        type T = number | string extends {} ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Object({}, { additionalProperties: false }))
        Assert.deepEqual(R, ExtendsResult.True)
    })

    it('Should extend Object 2', () => {
        type T = number | string extends { a: 10 } ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Object({}, { additionalProperties: true }))
        Assert.deepEqual(R, ExtendsResult.False)
    })

    it('Should extend Object 3', () => {
        type T = number | string extends object ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Object({}))
        Assert.deepEqual(R, ExtendsResult.False)
    })

    it('Should extend Union 1', () => {
        type T = number | string extends number | string ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Union([Type.Number(), Type.String()]))
        Assert.deepEqual(R, ExtendsResult.True)
    })

    it('Should extend Union 2', () => {
        type T = number | string extends any | number ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Union([Type.Any(), Type.String()]))
        Assert.deepEqual(R, ExtendsResult.True)
    })

    it('Should extend Union 3', () => {
        type T = number | string extends boolean | number ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Union([Type.Boolean(), Type.Number()]))
        Assert.deepEqual(R, ExtendsResult.False)
    })

    it('Should extend Union 4', () => {
        type T = any extends boolean | number ? 1 : 2
        const R = Extends.Check(Type.Any(), Type.Union([Type.Boolean(), Type.Number()]))
        Assert.deepEqual(R, ExtendsResult.Both)
    })
    it('Should extend Union 5', () => {
        type T = unknown | string extends boolean | number ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Unknown(), Type.String()]), Type.Union([Type.Boolean(), Type.Number()]))
        Assert.deepEqual(R, ExtendsResult.False)
    })
    
    it('Should extend Union 6', () => {
        type T = unknown extends boolean | number ? 1 : 2
        const R = Extends.Check(Type.Unknown(), Type.Union([Type.Boolean(), Type.Number()]))
        Assert.deepEqual(R, ExtendsResult.False)
    })


    it('Should extend Null', () => {
        type T = number | string extends null ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Null())
        Assert.deepEqual(R, ExtendsResult.False)
    })

    it('Should extend Undefined', () => {
        type T = number | string extends undefined ? 1 : 2
        const R = Extends.Check(Type.Union([Type.Number(), Type.String()]), Type.Undefined())
        Assert.deepEqual(R, ExtendsResult.False)
    })
})
