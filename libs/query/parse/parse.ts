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

import { TokenStream, TokenType, Token } from '../token/index'
import { Result } from './result'

// -------------------------------------------------------------------------
// Into<T>
// -------------------------------------------------------------------------

export type IntoTuple<T extends Parser<any>[]> = {
  [K in keyof T]: T[K] extends Parser<infer U> ? U : never
}
export type IntoUnion<T extends Parser<any>[]> = {
  [K in keyof T]: T[K] extends Parser<infer U> ? U : never
}[number]

// -------------------------------------------------------------------------
// ParserFunc<T>
// -------------------------------------------------------------------------

export type ParserResult<T> = [Result<T>, TokenStream]

export type ParserFunction<T> = (stream: TokenStream) => ParserResult<T>

export type MapFunction<T, U> = (value: T) => U

// -------------------------------------------------------------------------
// Parser<T>
// -------------------------------------------------------------------------

export class Parser<T = unknown> {
  constructor(private readonly parserFunction: ParserFunction<T>, private readonly error?: string) {}

  public Map<U>(mapFunction: MapFunction<T, U>): Parser<U> {
    return new Parser<U>((stream) => {
      if (stream.IsEmpty()) return [Result.Error(Error(this.error)), stream]
      const [result, rest] = this.parserFunction(stream.Clone())
      return [result.Map((value) => mapFunction(value)), rest]
    }, this.error)
  }

  public Error(message: string): Parser<T> {
    return new Parser<T>(this.parserFunction, message)
  }

  public Parse(stream: TokenStream): [Result<T>, TokenStream] {
    const [result, rest] = this.parserFunction(stream)
    return !result.Ok() && this.error ? [Result.Error(this.error), rest] : [result, rest]
  }
}

export namespace Parse {
  /** Creates a custom parser */
  export function Unsafe<T>(parserFunction: ParserFunction<T>) {
    return new Parser<T>(parserFunction)
  }

  /** Creates a union parser */
  export function Union<T extends Parser<any>[]>(parsers: [...T]) {
    return Parse.Unsafe<IntoUnion<T>>((stream) => {
      if (stream.IsEmpty()) {
        return [Result.Error('Union: End of stream'), stream]
      }
      for (const parser of parsers) {
        const [result, rest] = parser.Parse(stream.Clone())
        if (result.Ok()) return [result, rest]
      }
      return [Result.Error('Union: No match'), stream]
    })
  }

  /** Creates a fixed length tuple parser */
  export function Tuple<T extends Parser<any>[]>(parsers: [...T]) {
    return Parse.Unsafe<IntoTuple<T>>((stream) => {
      if (stream.IsEmpty()) {
        return [Result.Error('Tuple: End of stream'), stream]
      }
      const values: unknown[] = []
      let current = stream.Clone()
      for (const parser of parsers) {
        const [result, rest] = parser.Parse(current)
        if (!result.Ok()) {
          return [result, stream]
        } else {
          values.push(result.Value())
          current = rest
        }
      }
      return [Result.Ok(values), current]
    })
  }

  export interface ArrayOptions {
    minimum?: number
  }

  /** Creates an array parser */
  export function Array<T>(parser: Parser<T>, options: ArrayOptions = { minimum: 0 }) {
    return Parse.Unsafe<T[]>((stream) => {
      if (stream.IsEmpty()) {
        return [Result.Error('Array: End of stream'), stream]
      }
      const values: T[] = []
      let current = stream.Clone()
      while (true) {
        if (current.IsEmpty()) {
          break
        }
        const [result, rest] = parser.Parse(current)
        if (!result.Ok()) break
        values.push(result.Value())
        current = rest
      }
      if (options.minimum !== undefined && values.length < options.minimum) {
        return [Result.Error('Array: No match'), stream]
      } else {
        return [Result.Ok(values), current]
      }
    })
  }

  /** Creates a recursive parser */
  export function Recursive<T>(self: (parser: Parser) => Parser<T>): Parser<T> {
    const parser = Parse.Unsafe<T>((stream) => {
      const resolved = self(parser)
      return resolved.Parse(stream)
    })
    return parser as Parser<T>
  }

  /** Creates a parser that captures on the middle parser. */
  export function Group<T>(parsers: [left: Parser<any>, middle: Parser<T>, right: Parser<any>]) {
    return Parse.Tuple([parsers[0], parsers[1], parsers[2]])
      .Map((result) => result[1])
      .Error('Group: No match')
  }

  /** Creates a delimited parser */
  export function Delimited<T>(parser: Parser<T>, delimiter: Parser<any>) {
    const union = Parse.Union([Parse.Tuple([parser, delimiter]), Parse.Tuple([parser])])
    return Parse.Array(union)
      .Map((result) => result.map((value) => value[0]))
      .Error('Delimited: No match')
  }

  /** Creates a literal parser. */
  export function Literal<T extends string>(value: T) {
    return Parse.Unsafe<Token<string>>((stream) => {
      if (stream.IsEmpty()) {
        return [Result.Error('Literal: End of stream'), stream]
      }
      const rest = stream.Clone()
      const next = rest.Next()
      if (next.value !== value) {
        return [Result.Error('Literal: No match'), stream]
      } else {
        return [Result.Ok(next), rest]
      }
    })
  }

  /** Creates a parser that parses for the given token type. */
  export function Type(type: TokenType) {
    return Parse.Unsafe<Token<string>>((stream) => {
      const rest = stream.Clone()
      const next = rest.Next()
      return next.type !== type ? [Result.Error('Type: No match'), stream] : [Result.Ok(next), rest]
    })
  }

  /** Creates a parser that parses for single character tokens */
  export function Char() {
    return Parse.Type('char')
  }

  /** Creates a parser that parses for newline characters */
  export function Newline() {
    return Parse.Type('newline')
  }

  /** Creates a parser that parses for numeric values. */
  export function Number() {
    return Parse.Type('number')
  }

  /** Creates a parser that parses for quoted values. */
  export function Quoted() {
    return Parse.Type('quoted')
  }

  /** Creates a parser that parses for return characters */
  export function Return() {
    return Parse.Type('return')
  }

  /** Creates a parser that parses for tabspace characters */
  export function Tabspace() {
    return Parse.Type('tabspace')
  }

  /** Creates a parser that parses for whitespace characters */
  export function Whitespace() {
    return Parse.Type('whitespace')
  }

  /** Creates a parser that parses for multi character words */
  export function Word() {
    return Parse.Type('word')
  }

  /** Parses for a linear sequence of oprands and operators */
  export function Expression<Oprand extends Parser, Operator extends Parser>(oprand: Oprand, operator: Operator) {
    return Unsafe<unknown[]>((stream) => {
      const buffer: any[] = []
      const clone = stream.Clone()
      if (clone.IsEmpty()) return [Result.Error('Expected left oprand'), stream]
      const [result_0, rest_0] = oprand.Parse(clone)
      if (!result_0.Ok()) return [Result.Error('Left oprand invalid'), stream]

      if (rest_0.IsEmpty()) return [Result.Error('Expected operator'), stream]
      const [result_1, rest_1] = operator.Parse(rest_0)
      if (!result_1.Ok()) return [Result.Error('Operator oprand invalid'), stream]

      if (rest_1.IsEmpty()) return [Result.Error('Expected right oprand'), stream]
      const [result_2, rest_2] = oprand.Parse(rest_1)
      if (!result_2.Ok()) return [Result.Error('Right oprand invalid'), stream]

      buffer.push(result_0.Value())
      buffer.push(result_1.Value())
      buffer.push(result_2.Value())

      let current = rest_2
      while (true) {
        if (current.IsEmpty()) return [Result.Ok(buffer), current]
        const [result_0, rest_0] = operator.Parse(current.Clone())
        if (!result_0.Ok()) return [Result.Ok(buffer), current]

        if (rest_0.IsEmpty()) return [Result.Ok(buffer), current]
        const [result_1, rest_1] = oprand.Parse(rest_0)
        if (!result_1.Ok()) return [Result.Ok(buffer), current]

        buffer.push(result_0.Value())
        buffer.push(result_1.Value())
        current = rest_1
      }
    })
  }
}
