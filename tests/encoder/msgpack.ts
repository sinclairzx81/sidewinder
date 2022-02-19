import { MsgPackEncoder } from '@sidewinder/encoder'
import * as assert from '../assert/index'

describe('shared/encoder/MsgPack', () => {
    it('should encode and decode msgpack', () => {
        const encoder = new MsgPackEncoder()
        const input = assert.randomUUID()
        const output = encoder.decode(encoder.encode(input))
        assert.equal(input, output)
    })
})