import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TArray', () => {
  it('should guard for TArray', () => {
    const R = TypeGuard.TArray(Type.Array(Type.Number()))
    Assert.equal(R, true)
  })
  it('should not guard for TArray', () => {
    const R = TypeGuard.TArray(null)
    Assert.equal(R, false)
  })
  it('should guard for nested object TArray', () => {
    const R = TypeGuard.TArray(
      Type.Array(
        Type.Object({
          x: Type.Number(),
          y: Type.Number(),
        }),
      ),
    )
    Assert.equal(R, true)
  })
  it('should not guard for nested object TArray', () => {
    const R = TypeGuard.TArray(
      Type.Array(
        Type.Object({
          x: Type.Number(),
          y: {} as any,
        }),
      ),
    )
    Assert.equal(R, false)
  })
})
