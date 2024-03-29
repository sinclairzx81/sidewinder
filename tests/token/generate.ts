import { Generate } from '@sidewinder/token'

describe('token/Generate', () => {
  it('Should generate private and public key pair (2048)', () => {
    const [privateKey, publicKey] = Generate.KeyPair(2048)
  })

  it('Should generate private and public key pair (4096)', () => {
    const [privateKey, publicKey] = Generate.KeyPair(4096)
  }).timeout(20000)
})
