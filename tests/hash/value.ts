import { Assert } from '../assert/index'
import { ValueHash } from '@sidewinder/hash'

describe('hash/ValueHash', () => {
  it('should hash a number', async () => {
    const value = 1
    const hash = ValueHash.hash(value)
    const same = ValueHash.compare(value, hash)
    Assert.isTypeOf(hash, 'string')
    Assert.equal(same, true)
  })

  it('should hash a string', async () => {
    const value = 'hello'
    const hash = ValueHash.hash(value)
    const same = ValueHash.compare(value, hash)
    Assert.isTypeOf(hash, 'string')
    Assert.equal(same, true)
  })

  it('should hash a boolean', async () => {
    const value = true
    const hash = ValueHash.hash(value)
    const same = ValueHash.compare(value, hash)
    Assert.isTypeOf(hash, 'string')
    Assert.equal(same, true)
  })

  it('should hash a null', async () => {
    const value = null
    const hash = ValueHash.hash(value)
    const same = ValueHash.compare(value, hash)
    Assert.isTypeOf(hash, 'string')
    Assert.equal(same, true)
  })

  it('should not hash a undefined', async () => {
    Assert.throws(() => {
      const value = undefined
      const hash = ValueHash.hash(value)
      const same = ValueHash.compare(value, hash)
      Assert.isTypeOf(hash, 'string')
      Assert.equal(same, true)
    })
  })

  it('should hash a object', async () => {
    const value = { a: 1, b: true, c: 'hello' }
    const hash = ValueHash.hash(value)
    const same = ValueHash.compare(value, hash)
    Assert.isTypeOf(hash, 'string')
    Assert.equal(same, true)
  })

  it('should hash an array', async () => {
    const value = [1, 2, 3]
    const hash = ValueHash.hash(value)
    const same = ValueHash.compare(value, hash)
    Assert.isTypeOf(hash, 'string')
    Assert.equal(same, true)
  })
})
