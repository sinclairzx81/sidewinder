import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TAny', () => {
  it('should guard for TAny', () => {
    const R = TypeGuard.TAny(Type.Any())
    Assert.equal(R, true)
  })
  it('should not guard for TAny', () => {
    const R = TypeGuard.TAny(null)
    Assert.equal(R, false)
  })
})
