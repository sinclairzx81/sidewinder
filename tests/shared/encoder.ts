import { Encoder } from '@sidewinder/shared'
import { expect } from 'chai'

describe('Shared/Encoder', () => {
    it('Should encode and decode', () => {
        const input = 'hello world'
        const output = Encoder.decode(Encoder.encode(input))
        expect(input).to.eq(output)
    })
})