import { JsonEncoder } from '@sidewinder/shared'
import * as assert from '../../assert/index'

describe('shared/encoder/JsonEncoder', () => {
    it('should encode and decode json', () => {
        const encoder = new JsonEncoder()
        const input = assert.random()
        const output = encoder.decode(encoder.encode(input))
        assert.equal(input, output)
    })

})