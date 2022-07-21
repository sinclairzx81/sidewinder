import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TRef', () => {
  it('should guard for TRef', () => {
    const T = Type.Number({ $id: 'T' })
    const R = TypeGuard.TRef(Type.Ref(T))
    Assert.equal(R, true)
  })
  it('should not guard for TAny', () => {
    const R = TypeGuard.TRef(null)
    Assert.equal(R, false)
  })
})
