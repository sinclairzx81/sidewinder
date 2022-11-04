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
import { ArrayExpression } from './ArrayExpression'
import { LiteralExpression } from './LiteralExpression'
import { Identifier } from './Identifier'

export interface Property {
  type: 'Property'
  key: Identifier
  value: ObjectExpression | LiteralExpression
}

// prettier-ignore
export const Property = <P extends Parser>(ObjectExpression: P) =>
  Parse.Tuple([Identifier, Parse.Literal(':'), Parse.Union([
    ArrayExpression, 
    ObjectExpression, 
    LiteralExpression
  ])]).Map((result) => {
    return {
      type: 'Property',
      key: result[0],
      value: result[2],
    }
  })

export interface ObjectExpression {
  type: 'ObjectExpression'
  properties: Property[]
}

export const ObjectExpression: Parser<ObjectExpression> = Parse.Recursive((ObjectExpression) =>
  Parse.Group([Parse.Literal('{'), Parse.Delimited(Property(ObjectExpression), Parse.Literal(',')), Parse.Literal('}')]).Map((result) => {
    return {
      type: 'ObjectExpression',
      properties: result as any as Property[],
    }
  }),
)
