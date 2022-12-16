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

export const BinaryOperators = [
  '**',
  '*',
  '/',
  '%',
  '+',
  '-',
  '<<',
  '>>',
  '>>>',
  '<',
  '<=',
  '>',
  '>=',
  'like', // extended
  'includes', // extended
  'in',
  'instanceof',
  '==',
  '!=',
  '===',
  '!==',
  '&',
  '^',
  '|',
  '??',
  '&&',
  '||',
] as const

export type BinaryOperator = typeof BinaryOperators[number]
export const Exact = (input: string) => Parse.Tuple([Parse.Literal(input)])
export const Composite = (input: string) => Parse.Tuple(input.split('').map((char) => Parse.Literal(char)))

export const BinaryOperator = Parse.Union([
  Composite('**'),
  Composite('*'),
  Composite('/'),
  Composite('%'),
  Composite('+'),
  Composite('-'),
  Composite('<<'),
  Composite('>>>'),
  Composite('>>'),
  Composite('<='),
  Composite('>='),
  Composite('<'),
  Composite('>'),
  Exact('like'),
  Exact('in'),
  Exact('includes'),
  Exact('instanceof'),
  Composite('==='),
  Composite('!=='),
  Composite('=='),
  Composite('!='),
  Composite('&&'),
  Composite('&'),
  Composite('^'),
  Composite('||'),
  Composite('|'),
  Composite('??'),
]).Map((result) => result.map((token) => token.value).join(''))
