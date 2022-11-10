import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TUndefined', () => {
  it('Should guard for TUndefined', () => {
    const R = TypeGuard.TUndefined(Type.Undefined())
    Assert.equal(R, true)
  })
  it('Should not guard for TUndefined', () => {
    const R = TypeGuard.TUndefined(null)
    Assert.equal(R, false)
  })
  it('Should not guard for TUndefined with invalid $id', () => {
    // @ts-ignore
    const R = TypeGuard.TUndefined(Type.Undefined({ $id: 1 }))
    Assert.equal(R, false)
  })
})
