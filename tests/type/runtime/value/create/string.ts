import { Value } from '@sidewinder/type/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/create/String', () => {
  it('Should create value', () => {
    const T = Type.String()
    Assert.deepEqual(Value.Create(T), 0)
  })
  it('Should create default', () => {
    const T = Type.String({ default: 'hello' })
    Assert.deepEqual(Value.Create(T), 'hello')
  })
})
