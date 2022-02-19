import { Platform } from '@sidewinder/platform'
import * as assert from '../assert/index'

describe('platform/Environment', () => {

    it('should resolve the JavaScript environment', () => {
        const environment = Platform.platform()
        assert.equal(environment, 'node')
    })

    it('should resolve the Node version', () => {
        const version = Platform.version()
        assert.equal(typeof version.major, 'number')
        assert.equal(typeof version.minor, 'number')
        assert.equal(typeof version.revision, 'string')
    })
})