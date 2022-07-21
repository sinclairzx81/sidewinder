import { Static, TSchema } from '@sidewinder/type'

export function Expect<T extends TSchema>(schema: T) {
  return {
    ToBe: <U extends Static<T>>() => {},
  }
}
