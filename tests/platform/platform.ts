import { Environment } from '@sidewinder/shared'
import * as assert from '../assert/index'

describe('platform/Environment', () => {
    it('should resolve the JavaScript environment', () => {
        const environment = Environment.platform()
        assert.equal(environment, 'node')
    })
    it('should resolve the Node version', () => {
        const version = Environment.version()
        assert.equal(typeof version.major, 'number')
        assert.equal(typeof version.minor, 'number')
        assert.equal(typeof version.revision, 'string')
    })
})