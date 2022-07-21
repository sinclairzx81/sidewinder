import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TVoid', () => {
  it('should guard for TVoid', () => {
    const R = TypeGuard.TVoid(Type.Void())
    Assert.equal(R, true)
  })
  it('should not guard for TVoid', () => {
    const R = TypeGuard.TVoid(null)
    Assert.equal(R, false)
  })
})
