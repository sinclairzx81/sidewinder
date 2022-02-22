import { Platform } from '@sidewinder/platform'
import { Assert } from '../assert/index'

describe('platform/Environment', () => {
  it('should resolve the JavaScript environment', () => {
    const environment = Platform.platform()
    Assert.equal(environment, 'node')
  })

  it('should resolve the Node version', () => {
    const version = Platform.version()
    Assert.equal(typeof version.major, 'number')
    Assert.equal(typeof version.minor, 'number')
    Assert.equal(typeof version.revision, 'string')
  })
})
