import { Generate, TokenEncoder } from '@sidewinder/token'
import { Type }    from '@sidewinder/type'
import * as assert from '../assert/index'

describe('token/TokenEncoder', () => {

    it('should encode a token', () => {
        const [privateKey] = Generate.KeyPair()
        const T = Type.Object({
            name:  Type.String(),
            roles: Type.Array(Type.String())
        })
        const encoder = new TokenEncoder(T, privateKey)
        const encoded = encoder.encode({ name: 'dave', roles: ['admin', 'moderator']})
        assert.isTypeOf(encoded, 'string')
    })
    it('should throw if private key is invalid', () => {
        assert.throws(() => {
            const privateKey = 'nonsense'
            const T = Type.Object({
                name:  Type.String(),
                roles: Type.Array(Type.String())
            })
            const encoder = new TokenEncoder(T, privateKey)
            encoder.encode({ name: 'dave', roles: ['admin', 'moderator']})
        })
    })
    it('should throw on encode if data is invalid', () => {
        assert.throws(() => {
            const [privateKey] = Generate.KeyPair()
            const T = Type.Object({
                name:  Type.String(),
                roles: Type.Array(Type.String())
            })
            const encoder = new TokenEncoder(T, privateKey)
            // @ts-ignore
            const encoded = encoder.encode({ name: 1, roles: ['admin', 'moderator']})
        })
    })
})