import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TUint8Array', () => {
  it('should guard for TUint8Array', () => {
    const R = TypeGuard.TUint8Array(Type.Uint8Array())
    Assert.equal(R, true)
  })
  it('should not guard for TUint8Array', () => {
    const R = TypeGuard.TUint8Array(null)
    Assert.equal(R, false)
  })
})
