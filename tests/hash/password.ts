import { Assert } from '../assert/index'
import { PasswordHash } from '@sidewinder/hash'

describe('hash/PasswordHash', () => {
  it('Should hash a password', async () => {
    const hash = await PasswordHash.hash('this_is_a_password')
    Assert.isTypeOf(hash, 'string')
  })

  it('Should check a password success', async () => {
    const hash = await PasswordHash.hash('this_is_a_password')
    const result = await PasswordHash.compare('this_is_a_password', hash)
    Assert.equal(result, true)
  })

  it('Should check a password fail', async () => {
    const hash = await PasswordHash.hash('this_is_a_password')
    const result = await PasswordHash.compare('this_is_another_password', hash)
    Assert.equal(result, false)
  })

  it('Should check a password with varying iteration', async () => {
    const hash0 = await PasswordHash.hash('this_is_a_password', 0)
    const hash1 = await PasswordHash.hash('this_is_a_password', 1)
    const hash2 = await PasswordHash.hash('this_is_a_password', 2)
    const hash3 = await PasswordHash.hash('this_is_a_password', 3)
    const hash4 = await PasswordHash.hash('this_is_a_password', 4)
    const hash5 = await PasswordHash.hash('this_is_a_password', 5)
    const hash6 = await PasswordHash.hash('this_is_a_password', 6)
    const hash7 = await PasswordHash.hash('this_is_a_password', 7)
    const result0 = await PasswordHash.compare('this_is_a_password', hash0)
    const result1 = await PasswordHash.compare('this_is_a_password', hash1)
    const result2 = await PasswordHash.compare('this_is_a_password', hash2)
    const result3 = await PasswordHash.compare('this_is_a_password', hash3)
    const result4 = await PasswordHash.compare('this_is_a_password', hash4)
    const result5 = await PasswordHash.compare('this_is_a_password', hash5)
    const result6 = await PasswordHash.compare('this_is_a_password', hash6)
    const result7 = await PasswordHash.compare('this_is_a_password', hash7)
    Assert.equal(result0, true)
    Assert.equal(result1, true)
    Assert.equal(result2, true)
    Assert.equal(result3, true)
    Assert.equal(result4, true)
    Assert.equal(result5, true)
    Assert.equal(result6, true)
    Assert.equal(result7, true)
  })
})
