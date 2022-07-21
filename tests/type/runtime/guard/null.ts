import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TNull', () => {
  it('should guard for TNull', () => {
    const R = TypeGuard.TNull(Type.Null())
    Assert.equal(R, true)
  })
  it('should not guard for TNull', () => {
    const R = TypeGuard.TNull(null)
    Assert.equal(R, false)
  })
})
