import { Generate, TokenEncoder, TokenDecoder } from '@sidewinder/token'
import { Type } from '@sidewinder/type'

const Claims = Type.Object({
    username: Type.String(),
    roles:    Type.Array(Type.String())
})

const [privateKey, publicKey] = Generate.KeyPair()
const encoder = new TokenEncoder(Claims, privateKey)
const decoder = new TokenDecoder(Claims, publicKey)

const token = encoder.encode({
    username: 'dave',
    roles:   ['admin', 'moderator']
})

console.log(token)

const claims = decoder.decode(token)

console.log(claims)