import { TypeGuard } from '@sidewinder/type/guard'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('type/guard/TRecord', () => {
  it('should guard for TRecord', () => {
    const R = TypeGuard.TRecord(Type.Record(Type.String(), Type.Number()))
    Assert.equal(R, true)
  })

  it('should guard for TRecord with TObject value', () => {
    const R = TypeGuard.TRecord(
      Type.Record(
        Type.String(),
        Type.Object({
          x: Type.Number(),
          y: Type.Number(),
        }),
      ),
    )
    Assert.equal(R, true)
  })

  it('should not guard for TRecord', () => {
    const R = TypeGuard.TRecord(null)
    Assert.equal(R, false)
  })

  it('should not guard for TRecord with TObject value with invalid Property', () => {
    const R = TypeGuard.TRecord(
      Type.Record(
        Type.String(),
        Type.Object({
          x: Type.Number(),
          y: {} as any,
        }),
      ),
    )
    Assert.equal(R, false)
  })
})
