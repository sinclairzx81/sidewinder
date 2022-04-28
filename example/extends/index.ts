import * as Types from '@sidewinder/type'
import { Type, Static, Extends, ExtendsResult } from '@sidewinder/type'


type T = Array<any> extends  unknown ? 1 : 2

const A = Type.Any()

const B = Type.Union([Type.Unknown(), Type.String()])

const R = Extends.Check(Type.Array(Type.Any()), Type.Unknown())

console.log(ExtendsResult[R])


