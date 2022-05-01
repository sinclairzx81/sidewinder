import * as Types from '@sidewinder/type'
import { Type, Static, Extends, ExtendsResult } from '@sidewinder/type'
import { Value } from '@sidewinder/value'


type T0 = Record<'a' | 'b', number> extends { a: number, b: number } ? 1 : 2
type T1 = Record<string, number> extends { a: number, b: number } ? 1 : 2
type T2 = Record<number, number> extends { a: number, b: number } ? 1 : 2

type T3 = { a: number, b: number } extends Record<'a' | 'b', number> ? 1 : 2
type T4 = { a: number, b: number } extends Record<string, number> ? 1 : 2
type T5 = { a: number, b: number } extends Record<number, number> ? 1 : 2






