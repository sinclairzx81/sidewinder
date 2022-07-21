import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TNumber', () => {
  it('should guard for TNumber', () => {
    const R = TypeGuard.TNumber(Type.Number())
    Assert.equal(R, true)
  })
  it('should not guard for TNumber', () => {
    const R = TypeGuard.TNumber(null)
    Assert.equal(R, false)
  })
})
