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

import { Parse, Parser } from '../parse/index'
import { MemberExpression } from './MemberExpression'
import { Expression } from './Expression'
import { ParensGroup } from './ParensGroup'
import { LiteralExpression } from './LiteralExpression'
import { Identifier } from './Identifier'
import { BinaryOperator, BinaryOperators } from './BinaryOperator'
import { ArrayExpression } from './ArrayExpression'
import { ObjectExpression } from './ObjectExpression'

/** LR Expression Reduce */
// prettier-ignore
export const ReduceBinaryExpression = (spread: (Expression | BinaryOperator)[], reduce_operator: BinaryOperator): (Expression | BinaryOperator)[] => {
  const reduced = [] as (Expression | BinaryOperator)[]
  while (spread.length >= 3) {
    const [left, operator, right] = [
      spread.shift()! as Expression, 
      spread.shift()! as BinaryOperator, 
      spread.shift()! as Expression
    ] as [any, BinaryOperator, any]
    if (operator === reduce_operator) {
      const type = 'BinaryExpression'
      const expression: Expression = { type, operator, left, right }
      spread.unshift(expression)
    } else {
      spread.unshift(right)
      reduced.push(left)
      reduced.push(operator)
    }
  }
  return [...reduced, spread.shift()!]
}

export interface BinaryExpression {
  type: 'BinaryExpression'
  left: Expression
  right: Expression
  operator: BinaryOperator
}

export const BinaryExpression: Parser<BinaryExpression> = Parse.Recursive<BinaryExpression>((BinaryExpression) =>
  Parse.Union([
    Parse.Expression(
      Parse.Union([
        MemberExpression,
        LiteralExpression,
        ArrayExpression,
        ObjectExpression,
        Identifier,
        ParensGroup(MemberExpression),
        ParensGroup(LiteralExpression),
        ParensGroup(ArrayExpression),
        ParensGroup(ObjectExpression),
        ParensGroup(Identifier),
        ParensGroup(BinaryExpression),
      ]),
      BinaryOperator,
    )
      .Map((delimited: any[]) => {
        return BinaryOperators.reduce((spread: any[], operator: any) => {
          return spread.length === 1 ? spread : ReduceBinaryExpression(spread, operator)
        }, delimited)
      })
      .Map((result) => result[0]),
  ]),
)
