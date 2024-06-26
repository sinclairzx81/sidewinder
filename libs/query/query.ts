/*--------------------------------------------------------------------------

@sidewinder/query

The MIT License (MIT)

Copyright (c) 2022-2024 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { TokenStream } from './token/index'
import { BinaryExpression, Expression } from './syntax/index'
import { Generate } from './generate/index'

// ----------------------------------------------------
// Mongo Filter Like
// ----------------------------------------------------

export type Value = any
export type Filter = {
  $and?: [Filter, Filter]
  $or?: [Filter, Filter]
  $gt?: Filter
  $lt?: Filter
  $gte?: Filter
  $lte?: Filter
  $ne?: Filter
  $in?: Filter
} & {
  [key: string]: Filter | Value
}

/** Returns the parsed expression tree for the given filter */
export function Expr(expr: string): Expression {
  const tokens = TokenStream.Create(expr, ['newline', 'return', 'tabspace', 'whitespace'])
  const [result, rest] = BinaryExpression.Parse(tokens)
  if (!rest.IsEmpty()) {
    const index = rest.Next().index
    const consumed = expr.slice(0, index)
    const unexpected = expr.slice(index)
    throw Error(`query syntax error: ${consumed}!!${unexpected}`)
  }
  if (result.Ok()) return result.Value()
  throw result.Error()
}

/** Returns a mongodb filter for the given query expression */
export function Query(expr: string): Filter {
  return Generate.Create(Expr(expr))
}
