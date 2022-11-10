import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TUnknown', () => {
  it('Should guard for TUnknown', () => {
    const R = TypeGuard.TUnknown(Type.Unknown())
    Assert.equal(R, true)
  })
  it('Should not guard for TUnknown', () => {
    const R = TypeGuard.TUnknown(null)
    Assert.equal(R, false)
  })
  it('Should not guard for TUnknown with invalid $id', () => {
    // @ts-ignore
    const R = TypeGuard.TUnknown(Type.Unknown({ $id: 1 }))
    Assert.equal(R, false)
  })
})
