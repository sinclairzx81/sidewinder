import { JsonEncoder, MsgPackEncoder } from '@sidewinder/shared'
import { expect } from 'chai'

describe('shared/encoder', () => {
    it('should encode and decode json', () => {
        const encoder = new JsonEncoder()
        const input = 'hello world'
        const output = encoder.decode(encoder.encode(input))
        expect(input).to.eq(output)
    })
    it('should encode and decode msgpack', () => {
        const encoder = new MsgPackEncoder()
        const input = 'hello world'
        const output = encoder.decode(encoder.encode(input))
        expect(input).to.eq(output)
    })
})