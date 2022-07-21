import { Expect } from './assert'
import { Type } from '@sidewinder/type'

Expect(Type.Unknown()).ToBe<unknown>()
