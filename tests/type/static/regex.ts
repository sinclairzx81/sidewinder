import { Expect } from './assert'
import { Type } from '@sidewinder/type'

Expect(Type.RegEx(/foo/)).ToBe<string>()
