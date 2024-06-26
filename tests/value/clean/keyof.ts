import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/KeyOf', () => {
  it('Should clean 1', () => {
    const T = Type.KeyOf(Type.Object({ x: Type.Number(), y: Type.Number() }))
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
})
