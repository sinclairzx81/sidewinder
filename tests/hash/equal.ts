import { Assert } from '../assert/index'
import { Equal } from '@sidewinder/hash'

describe('hash/Equal', () => {
  it('Should return true for strings', () => {
    const result = Equal.equal('hello', 'hello')
    Assert.equal(result, true)
  })
  it('Should return false for strings', () => {
    const result = Equal.equal('hello', 'world')
    Assert.equal(result, false)
  })

  it('Should return true for Uint8Array', () => {
    const result = Equal.equal(new Uint8Array([0, 1, 2, 3]), new Uint8Array([0, 1, 2, 3]))
    Assert.equal(result, true)
  })
  it('Should return false for Uint8Array', () => {
    const result = Equal.equal(new Uint8Array([0, 1, 2, 3]), new Uint8Array([0, 1, 2, 4]))
    Assert.equal(result, false)
  })
})
