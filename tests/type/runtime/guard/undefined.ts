import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TUndefined', () => {
  it('should guard for TUndefined', () => {
    const R = TypeGuard.TUndefined(Type.Undefined())
    Assert.equal(R, true)
  })
  it('should not guard for TUndefined', () => {
    const R = TypeGuard.TUndefined(null)
    Assert.equal(R, false)
  })
})
