import { JsonEncoder } from '@sidewinder/encoder'
import * as assert from '../assert/index'

describe('shared/encoder/JsonEncoder', () => {
    it('should encode and decode json', () => {
        const encoder = new JsonEncoder()
        const input = assert.randomUUID()
        const output = encoder.decode(encoder.encode(input))
        assert.equal(input, output)
    })

})