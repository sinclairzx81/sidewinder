import { Value } from '@sidewinder/value'
import { Custom } from '@sidewinder/type/custom'
import { Type, Kind } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('type/check/Custom', () => {
  Custom.Set('BigInt', (schema, value) => typeof value === 'bigint')

  it('Should validate bigint', () => {
    const T = Type.Unsafe({ [Kind]: 'BigInt' })
    Assert.deepEqual(Value.Check(T, 1n), true)
  })

  it('Should not validate bigint', () => {
    const T = Type.Unsafe({ [Kind]: 'BigInt' })
    Assert.deepEqual(Value.Check(T, 1), false)
  })

  it('Should validate bigint nested', () => {
    const T = Type.Object({
      x: Type.Unsafe({ [Kind]: 'BigInt' }),
    })
    Assert.deepEqual(Value.Check(T, { x: 1n }), true)
  })

  it('Should not validate bigint nested', () => {
    const T = Type.Object({
      x: Type.Unsafe({ [Kind]: 'BigInt' }),
    })
    Assert.deepEqual(Value.Check(T, { x: 1 }), false)
  })
})
