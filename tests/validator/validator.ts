import { Validator } from '@sidewinder/validator'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('validator/Validator', () => {
  it('Should validate data with assert', () => {
    const T = Type.String()
    const V = new Validator(T)
    V.assert('hello')
  })

  it('Should throw when validating invalid data with assert', () => {
    Assert.throws(() => {
      const T = Type.String()
      const V = new Validator(T)
      V.assert(1)
    })
  })

  it('Should validate data with check', () => {
    const T = Type.String()
    const V = new Validator(T)
    const R = V.check('hello')
    Assert.deepEqual(R, {
      success: true,
      errors: [],
      errorText: '',
    })
  })

  it('Should return success false when using check on invalid data', () => {
    const T = Type.String()
    const V = new Validator(T)
    const R = V.check(1)
    Assert.equal(R.success, false)
    Assert.equal(R.errors.length > 0, true)
    Assert.equal(R.errorText !== '', true)
  })

  it('Should validate email', () => {
    const T = Type.String({ format: 'email' })
    const V = new Validator(T)
    const R1 = V.check('dave@domain.com')
    const R2 = V.check('not_an_email')
    Assert.equal(R1.success, true)
    Assert.equal(R2.success, false)
  })

  it('Should validate uuid', () => {
    const T = Type.String({ format: 'uuid' })
    const V = new Validator(T)
    const R1 = V.check('0b15a5f5-98b7-4aa6-881a-c4e48e4073f2')
    const R2 = V.check('123')
    Assert.equal(R1.success, true)
    Assert.equal(R2.success, false)
  })

  it('Should validate date-time', () => {
    const T = Type.String({ format: 'date-time' })
    const V = new Validator(T)
    const R1 = V.check('2022-11-10T08:01:34.136Z')
    const R2 = V.check('123')
    Assert.equal(R1.success, true)
    Assert.equal(R2.success, false)
  })

  it('Should validate date', () => {
    const T = Type.String({ format: 'date' })
    const V = new Validator(T)
    const R1 = V.check('2022-11-10')
    const R2 = V.check('123')
    Assert.equal(R1.success, true)
    Assert.equal(R2.success, false)
  })

  it('Should validate time', () => {
    const T = Type.String({ format: 'time' })
    const V = new Validator(T)
    const R1 = V.check('08:01:34.136Z')
    const R2 = V.check('08:01:34')
    const R3 = V.check('123')
    Assert.equal(R1.success, true)
    Assert.equal(R2.success, true)
    Assert.equal(R3.success, false)
  })

  it('Should validate url', () => {
    const T = Type.String({ format: 'url' })
    const V = new Validator(T)
    const R1 = V.check('http://domain.com/path')
    const R2 = V.check('https://domain.com/path')
    const R3 = V.check('ws://domain.com/path')
    const R4 = V.check('wss://domain.com/path')
    const R5 = V.check('ftp://domain.com/path')
    const R6 = V.check('not-a-hostname')
    Assert.equal(R1.success, true)
    Assert.equal(R2.success, true)
    Assert.equal(R3.success, true)
    Assert.equal(R4.success, true)
    Assert.equal(R5.success, true)
    Assert.equal(R6.success, false)
  })

  it('Should validate ipv6', () => {
    const T = Type.String({ format: 'ipv6' })
    const V = new Validator(T)
    const R1 = V.check('::1')
    const R2 = V.check('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    const R3 = V.check('0.0.0.0')
    Assert.equal(R1.success, true)
    Assert.equal(R2.success, true)
    Assert.equal(R3.success, false)
  })

  it('Should validate ipv4', () => {
    const T = Type.String({ format: 'ipv4' })
    const V = new Validator(T)
    const R1 = V.check('10.0.0.1')
    const R2 = V.check('not-a-ipv4')
    Assert.equal(R1.success, true)
    Assert.equal(R2.success, false)
  })
})
