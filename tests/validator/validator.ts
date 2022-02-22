import { Validator } from '@sidewinder/validator'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('validator/Validator', () => {
  it('should validate data with assert', () => {
    const T = Type.String()
    const V = new Validator(T)
    V.assert('hello')
  })

  it('should throw when validating invalid data with assert', () => {
    Assert.throws(() => {
      const T = Type.String()
      const V = new Validator(T)
      V.assert(1)
    })
  })

  it('should validate data with check', () => {
    const T = Type.String()
    const V = new Validator(T)
    const R = V.check('hello')
    Assert.deepEqual(R, {
      success: true,
      errors: [],
      errorText: '',
    })
  })

  it('should return success false when using check on invalid data', () => {
    const T = Type.String()
    const V = new Validator(T)
    const R = V.check(1)
    Assert.equal(R.success, false)
    Assert.equal(R.errors.length > 0, true)
    Assert.equal(R.errorText !== '', true)
  })
})
