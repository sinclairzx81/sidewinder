import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TPromise', () => {
  it('should guard for TPromise', () => {
    const R = TypeGuard.TPromise(Type.Promise(Type.Number()))
    Assert.equal(R, true)
  })
  it('should not guard for TPromise', () => {
    const R = TypeGuard.TPromise(null)
    Assert.equal(R, false)
  })
  it('should guard for TPromise with nested TObject', () => {
    const R = TypeGuard.TPromise(
      Type.Promise(
        Type.Object({
          x: Type.Number(),
          y: Type.Number(),
        }),
      ),
    )
    Assert.equal(R, true)
  })

  it('should not guard for TPromise with nested TObject', () => {
    const R = TypeGuard.TPromise(
      Type.Promise(
        Type.Object({
          x: Type.Number(),
          y: {} as any,
        }),
      ),
    )
    Assert.equal(R, false)
  })
})
