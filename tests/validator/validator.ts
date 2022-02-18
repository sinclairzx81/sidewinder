import { Validator } from '@sidewinder/validation'
import { Type }     from '@sidewinder/type'
import * as assert from '../assert/index'

describe('validator/Validator', () => {
    
    it('should validate data with assert', () => {
        const T = Type.String()
        const V = new Validator(T)
        V.assert('hello')
    })

    it('should throw when validating invalid data with assert', () => {
        assert.throws(() => {
            const T = Type.String()
            const V = new Validator(T)
            V.assert(1)
        })
    })

    it('should validate data with check', () => {
        const T = Type.String()
        const V = new Validator(T)
        const R = V.check('hello')
        assert.deepEqual(R, {
            success: true,
            errors: [],
            errorText: ''
        })
    })

    it('should return success false when using check on invalid data', () => {
        const T = Type.String()
        const V = new Validator(T)
        const R = V.check(1)
        assert.equal(R.success, false)
        assert.equal(R.errors.length > 0, true)
        assert.equal(R.errorText !== '', true)
    })
})