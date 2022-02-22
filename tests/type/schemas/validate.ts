import { Compiler, Validator } from '@sidewinder/validator'
import { TSchema } from '@sidewinder/type'

export function ok<T extends TSchema>(type: T, data: unknown, additional: any[] = []) {
  Compiler.addSchema(additional)
  const validator = new Validator(type)
  const result = validator.check(data)
  if (!result.success) {
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
    console.log(result.errorText)
    throw Error('expected ok')
  }
}

export function fail<T extends TSchema>(type: T, data: unknown, additional: any[] = []) {
  Compiler.addSchema(additional)
  const validator = new Validator(type)
  const result = validator.check(data)
  if (result.success) {
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
    console.log(result.errorText)
    throw Error('expected ok')
  }
}
