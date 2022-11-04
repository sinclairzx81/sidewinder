/*--------------------------------------------------------------------------

@sidewinder/query

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { Parse } from '../parse/index'

// prettier-ignore
export const NumberLiteral = Parse.Union([
  Parse.Tuple([Parse.Number()]),
  Parse.Tuple([Parse.Literal('-'), Parse.Number()]),
  
]).Map(results => {
  return results.length === 2 
    ? parseFloat(results[1].value) * -1 
    : parseFloat(results[0].value)
})

// prettier-ignore
export const StringLiteral = Parse.Quoted().Map((result) => {
  return result.value.replace(/'|"/g, '')
})

// prettier-ignore
export const BooleanLiteral = Parse.Union([
  Parse.Literal('true'), 
  Parse.Literal('false')
]).Map((result) => result.value === 'true')

export interface LiteralExpression {
  type: 'LiteralExpression'
  value: string | number | boolean
}

// prettier-ignore
export const LiteralExpression = Parse.Union([
  BooleanLiteral, 
  NumberLiteral, 
  StringLiteral
]).Map((result) => {
  return {
    type: 'LiteralExpression',
    value: result,
  } as const
})
