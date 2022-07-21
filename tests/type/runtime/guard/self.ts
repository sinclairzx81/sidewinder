import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TSelf', () => {
  it('should guard for TSelf', () => {
    Type.Recursive((T) => {
      const R = TypeGuard.TSelf(T)
      Assert.equal(R, true)
      return Type.Object({ t: Type.Array(T) })
    })
  })
})
