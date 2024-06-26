import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/convert/Array', () => {
  it('Should convert array of number', () => {
    const T = Type.Array(Type.Number())
    const R = Value.Convert(T, [1, 3.14, '1', '3.14', true, false, 'true', 'false', 'hello'])
    Assert.deepEqual(R, [1, 3.14, 1, 3.14, 1, 0, 1, 0, 'hello'])
  })
  it('Should convert array of boolean', () => {
    const T = Type.Array(Type.Boolean())
    const R = Value.Convert(T, [1, 3.14, '1', '3.14', true, false, 'true', 'false', 'hello'])
    Assert.deepEqual(R, [true, 3.14, true, '3.14', true, false, true, false, 'hello'])
  })
  it('Should convert array of string', () => {
    const T = Type.Array(Type.String())
    const R = Value.Convert(T, [1, 3.14, '1', '3.14', true, false, 'true', 'false', 'hello'])
    Assert.deepEqual(R, ['1', '3.14', '1', '3.14', 'true', 'false', 'true', 'false', 'hello'])
  })
  it('Should convert array of date', () => {
    const T = Type.Array(Type.Date())
    const R = Value.Convert(T, [1, '1', true, false, 'true', 'false', 'hello']) as any[]
    Assert.deepEqual(R[0].getTime(), 1)
    Assert.deepEqual(R[1].getTime(), 1)
    Assert.deepEqual(R[2].getTime(), 1)
    Assert.deepEqual(R[3].getTime(), 0)
    Assert.deepEqual(R[4].getTime(), 1)
    Assert.deepEqual(R[5].getTime(), 0)
    Assert.deepEqual(R[6], 'hello')
  })
  // ----------------------------------------------------------------
  // Array Coercion
  // ----------------------------------------------------------------
  it('Should convert into array (convert interior)', () => {
    const T = Type.Array(Type.Number())
    const R = Value.Convert(T, '1')
    Assert.deepEqual(R, [1])
  })
  it('Should convert into array (retain interior)', () => {
    const T = Type.Array(Type.Number())
    const R = Value.Convert(T, 'A')
    Assert.deepEqual(R, ['A'])
  })
  it('Should convert into array (object)', () => {
    const T = Type.Array(
      Type.Object({
        x: Type.Number(),
        y: Type.Number(),
        z: Type.Number(),
      }),
    )
    const R = Value.Convert(T, { x: '1', y: true, z: null })
    Assert.deepEqual(R, [{ x: 1, y: 1, z: null }])
  })
})
