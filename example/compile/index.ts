import { Type } from '@sidewinder/contract'
import { WebClient } from '@sidewinder/client'
import { WebService, Host } from '@sidewinder/server'

import { Validator } from '@sidewinder/validator'
import { Value } from '@sidewinder/value'

const T = Type.Object({
    email: Type.String({ format: 'ipv4' })
})

const validator = new Validator(T)

const date = new Date()

console.log(date.toISOString())

console.log(validator.check({
    email: '10.0.0.0'
}))

