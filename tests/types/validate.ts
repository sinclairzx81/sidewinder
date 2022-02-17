import { Compiler } from '@sidewinder/validation'
import { TSchema } from '@sidewinder/types'
import addFormats from 'ajv-formats'
import Ajv, { AnySchema } from 'ajv/dist/2019'

export function ok<T extends TSchema>(type: T, data: unknown, additional: AnySchema[] = []) {
    const validate = Compiler.compile(type, additional as any[])

    const facade: any = validate
    function execute() { // required as ajv will throw if referenced schema is not found
        try { return validate(type, data as any) } catch { return false }
    }
    if (execute() === false) {
        console.log('---------------------------')
        console.log('type')
        console.log('---------------------------')
        console.log(JSON.stringify(type, null, 2))
        console.log('---------------------------')
        console.log('data')
        console.log('---------------------------')
        console.log(JSON.stringify(data, null, 2))
        console.log('---------------------------')
        console.log('errors')
        console.log('---------------------------')
        console.log(validate.errorsText(validate.errors))
        throw Error('expected ok')
    }
}

export function fail<T extends TSchema>(type: T, data: unknown, additional: AnySchema[] = []) {
    const ajv = validator(additional)
    function execute() { // required as ajv will throw if referenced schema is not found
        try { return ajv.validate(type, data) as boolean } catch { return false }
    }
    if (execute() === true) {
        console.log('---------------------------')
        console.log('type')
        console.log('---------------------------')
        console.log(JSON.stringify(type, null, 2))
        console.log('---------------------------')
        console.log('data')
        console.log('---------------------------')
        console.log(JSON.stringify(data, null, 2))
        console.log('---------------------------')
        console.log('errors')
        console.log('---------------------------')
        console.log(ajv.errorsText(ajv.errors))
        throw Error('expected ok')
    }
}