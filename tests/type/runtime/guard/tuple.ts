import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TTuple', () => {
  it('should guard for TTuple', () => {
    const R = TypeGuard.TTuple(Type.Tuple([Type.Number(), Type.Number()]))
    Assert.equal(R, true)
  })
  it('should not guard for TTuple', () => {
    const R = TypeGuard.TTuple(null)
    Assert.equal(R, false)
  })
  it('should not guard for TTuple with invalid Items', () => {
    const R = TypeGuard.TTuple(Type.Tuple([Type.Number(), {} as any]))
    Assert.equal(R, false)
  })
})
