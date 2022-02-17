import { Type }    from '@sidewinder/types'
import * as assert from 'assert'

describe('Modifier', () => {
    it('Omit modifier', () => {
        const T = Type.Object({
            a: Type.Readonly(Type.String()),
            b: Type.Optional(Type.String()),
        })
        const S = JSON.stringify(T)
        const P = JSON.parse(S) as any

        // check assignment on Type
        assert.equal(T.properties.a.modifier, 'Readonly')
        assert.equal(T.properties.b.modifier, 'Optional')

        // check deserialized
        assert.equal(P.properties.a.modifier, undefined)
        assert.equal(P.properties.b.modifier, undefined)
    })
})
