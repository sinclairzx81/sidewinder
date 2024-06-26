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

import * as Syntax from '../syntax/index'

export namespace Generate {
  function ArrayExpression(expression: Syntax.ArrayExpression): any {
    return [...expression.items.map((item) => Visit(item))]
  }

  function ObjectExpression(expression: Syntax.ObjectExpression): any {
    return expression.properties.reduce((acc, property) => {
      return { ...acc, [Visit(property.key)]: Visit(property.value) }
    }, {})
  }

  function BinaryExpression(expression: Syntax.BinaryExpression): any {
    switch (expression.operator) {
      case '&&':
        return { $and: [Visit(expression.left), Visit(expression.right)] }
      case '||':
        return { $or: [Visit(expression.left), Visit(expression.right)] }
      case '===':
        return { [Visit(expression.left)]: Visit(expression.right) }
      case '==':
        return { [Visit(expression.left)]: Visit(expression.right) }
      case '!==':
        return { [Visit(expression.left)]: { $ne: Visit(expression.right) } }
      case '!=':
        return { [Visit(expression.left)]: { $ne: Visit(expression.right) } }
      case 'in':
        return { [Visit(expression.left)]: { $in: Visit(expression.right) } }
      case '>':
        return { [Visit(expression.left)]: { $gt: Visit(expression.right) } }
      case '<':
        return { [Visit(expression.left)]: { $lt: Visit(expression.right) } }
      case '>=':
        return { [Visit(expression.left)]: { $gte: Visit(expression.right) } }
      case '<=':
        return { [Visit(expression.left)]: { $lte: Visit(expression.right) } }
      case 'like':
        return { [Visit(expression.left)]: new RegExp(Visit(expression.right), 'i') }
      case 'includes':
        return { [Visit(expression.left)]: { $elemMatch: Visit(expression.right) } }
    }
  }

  function Identifier(identifier: Syntax.Identifier) {
    return identifier.value
  }

  function LiteralExpression(expression: Syntax.LiteralExpression) {
    return expression.value
  }

  function MemberExpression(expression: Syntax.MemberExpression) {
    return expression.value
  }

  function Visit(expression: Syntax.Expression) {
    switch (expression.type) {
      case 'ArrayExpression':
        return ArrayExpression(expression)
      case 'BinaryExpression':
        return BinaryExpression(expression)
      case 'Identifier':
        return Identifier(expression)
      case 'LiteralExpression':
        return LiteralExpression(expression)
      case 'MemberExpression':
        return MemberExpression(expression)
      case 'ObjectExpression':
        return ObjectExpression(expression)
      default:
        new Error('Unknown Expression')
    }
  }

  export function Create(expression: Syntax.Expression) {
    return Visit(expression)
  }
}
