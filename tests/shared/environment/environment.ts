import { Environment } from '@sidewinder/shared'
import * as assert from '../../assert/index'

describe('shared/environment/Environment', () => {
    const environment = Environment.resolve()
    assert.equal(environment, 'node')
})