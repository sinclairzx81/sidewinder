import { Generate, TokenEncoder, TokenDecoder } from '@sidewinder/token'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('token/TokenDecoder', () => {
  it('Should decode a token', () => {
    const [privateKey, publicKey] = Generate.KeyPair()
    const T = Type.Object({
      name: Type.String(),
      roles: Type.Array(Type.String()),
    })
    const encoder = new TokenEncoder(T, privateKey)
    const decoder = new TokenDecoder(T, publicKey)

    const encoded = encoder.encode({ name: 'dave', roles: ['admin', 'moderator'] })
    const decoded = decoder.decode(encoded)
    Assert.isTypeOf(decoded.iat, 'number')
    Assert.deepEqual(decoded.name, 'dave')
    Assert.deepEqual(decoded.roles, ['admin', 'moderator'])
  })

  it('Should throw if public key is invalid', () => {
    Assert.throws(() => {
      const [privateKey] = Generate.KeyPair()
      const publicKey = 'nonsense'
      const T = Type.Object({
        name: Type.String(),
        roles: Type.Array(Type.String()),
      })
      const encoder = new TokenEncoder(T, privateKey)
      const decoder = new TokenDecoder(T, publicKey)

      const encoded = encoder.encode({ name: 'dave', roles: ['admin', 'moderator'] })
      decoder.decode(encoded)
    })
  })

  it('Should throw on decode if publicKey is invalid', () => {
    Assert.throws(() => {
      const [privateKey1, publicKey1] = Generate.KeyPair()
      const [privateKey2, publicKey2] = Generate.KeyPair()
      const T = Type.Object({
        name: Type.String(),
        roles: Type.Array(Type.String()),
      })
      const encoder = new TokenEncoder(T, privateKey1)
      const decoder = new TokenDecoder(T, publicKey2)

      const encoded = encoder.encode({ name: 'dave', roles: ['admin', 'moderator'] })
      decoder.decode(encoded)
    })
  })

  it('Should throw on decode if decoded data is invalid', () => {
    Assert.throws(() => {
      const [privateKey, publicKey] = Generate.KeyPair()
      const T1 = Type.Object({
        name: Type.String(),
        roles: Type.Array(Type.String()),
      })
      const T2 = Type.Object({
        name: Type.Number(),
        roles: Type.Boolean(),
      })
      const encoder = new TokenEncoder(T1, privateKey)
      const decoder = new TokenDecoder(T2, publicKey)
      const encoded = encoder.encode({ name: 'dave', roles: ['admin', 'moderator'] })
      decoder.decode(encoded)
    })
  })

  it('Should decode token with encryption', () => {
    const [privateKey, publicKey] = Generate.KeyPair()
    const T = Type.Object({
      name: Type.String(),
      roles: Type.Array(Type.String()),
    })
    const encoder = new TokenEncoder(T, privateKey, { useEncryption: true })
    const decoder = new TokenDecoder(T, publicKey, { useEncryption: true })
    const encoded = encoder.encode({ name: 'dave', roles: ['admin', 'moderator'] })
    decoder.decode(encoded)
  })

  it('Should throw on decode token with encryption when data in bad', () => {
    Assert.throws(() => {
      const [privateKey, publicKey] = Generate.KeyPair()
      const T = Type.Object({
        name: Type.String(),
        roles: Type.Array(Type.String()),
      })

      const encoder = new TokenEncoder(T, privateKey, { useEncryption: false })
      const decoder = new TokenDecoder(T, publicKey, { useEncryption: true })
      const encoded = encoder.encode({ name: 'dave', roles: ['admin', 'moderator'] })
      decoder.decode(encoded)
    })
  })
})
