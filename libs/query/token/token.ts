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

// --------------------------------------------------------------
// Tokens
// --------------------------------------------------------------

export type TokenType = 'whitespace' | 'word' | 'number' | 'quoted' | 'char' | 'newline' | 'return' | 'tabspace'

export interface Token<V extends string> {
  type: TokenType
  index: number
  value: V
}

// --------------------------------------------------------------
// CharStream
// --------------------------------------------------------------

export class CharStream {
  constructor(private readonly content: string, private index: number = 0) {}

  public IsEmpty(): boolean {
    return this.index >= this.content.length
  }
  public Position(): number {
    return this.index
  }
  public Peek(): { index: number; value: string } | undefined {
    if (this.IsEmpty()) return undefined
    const value = this.content.charAt(this.index)
    return value ? { index: this.index, value } : undefined
  }

  public Next(): { index: number; value: string } | undefined {
    if (this.IsEmpty()) return undefined
    const value = this.content.charAt(this.index++)
    return value ? { index: this.index, value } : undefined
  }

  public Clone(): CharStream {
    return new CharStream(this.content, this.index)
  }
}

// --------------------------------------------------------------
// TokenGenerator
// --------------------------------------------------------------

export class TokenGenerator {
  private numerics = '0123456789'.split('')
  private alphas = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  private quotes = ['"', "'", '`']

  private IsNumeric(char: string) {
    return this.numerics.includes(char)
  }
  private IsAlpha(char: string) {
    return this.alphas.includes(char)
  }
  private IsQuote(char: string) {
    return this.quotes.includes(char)
  }
  private IsWhitespace(char: string) {
    return char === ' '
  }
  private isPeriod(char: string) {
    return char === '.'
  }
  private isUnderscore(char: string) {
    return char === '_'
  }
  private IsTabspace(char: string) {
    return char === '\t'
  }
  private IsNewline(char: string) {
    return char === '\n'
  }
  private IsReturn(char: string) {
    return char === '\r'
  }

  // ----------------------------------------------------------
  // Consume
  // ----------------------------------------------------------

  private ConsumeChar(stream: CharStream): Token<string> {
    const { index, value } = stream.Next()!
    return { index, type: 'char', value }
  }

  private ConsumeTabspace(stream: CharStream): Token<string> {
    const { index, value } = stream.Next()!
    return { index, type: 'tabspace', value }
  }

  private ConsumeNewline(stream: CharStream): Token<string> {
    const { index, value } = stream.Next()!
    return { index, type: 'newline', value }
  }

  private ConsumeReturn(stream: CharStream): Token<string> {
    const { index, value } = stream.Next()!
    return { index, type: 'return', value }
  }

  private ConsumeWhitespace(stream: CharStream): Token<string> {
    const type = 'whitespace'
    const buffer: string[] = []
    const index = stream.Position()
    while (!stream.IsEmpty()) {
      const peek = stream.Peek()!
      if (!this.IsWhitespace(peek.value)) break
      const next = stream.Next()!
      buffer.push(next.value)
    }
    const value = buffer.join('')
    return { index, type, value }
  }

  private ConsumeWord(stream: CharStream): Token<string> {
    const type = 'word'
    const index = stream.Position()
    const buffer: string[] = []
    {
      // read: We assume that first character is an alpha
      // thus we allow for reading subsequent numerics as
      // these would constitute as valid variables.
      while (!stream.IsEmpty()) {
        const peek = stream.Peek()!
        const [isAlpha, isNumeric] = [this.IsAlpha(peek.value), this.IsNumeric(peek.value)]
        if (!isAlpha && !isNumeric) break
        const next = stream.Next()!
        buffer.push(next.value)
      }
    }
    const value = buffer.join('')
    return { index, type, value }
  }

  private ConsumeNumber(stream: CharStream): Token<string> {
    const type = 'number'
    const index = stream.Position()
    // {
    //   // leading-zero: We disallow leading zeros. Here we
    //   // check the first value, and return it immediately
    //   // if it's a zero. This is still read as a number.
    //   const first = stream.Peek()!
    //   if (first.value === '0') {
    //     const next = stream.Next()!
    //     const value = next.value
    //     return { index, type, value }
    //   }
    // }
    const buffer: string[] = []
    {
      let foundPeriod = false
      let lastChar = ''
      while (!stream.IsEmpty()) {
        const peek = stream.Peek()!
        const [isNumeric, isPeriod, isUnderscore] = [this.IsNumeric(peek.value), this.isPeriod(peek.value), this.isUnderscore(peek.value)]
        // disallow invalid characters
        if (!isUnderscore && !isNumeric && !isPeriod) break
        // disallow multiple subsequent underscores
        if (isUnderscore && this.isUnderscore(lastChar)) break
        // disallow multiple periods
        if (isPeriod && foundPeriod) break
        if (isPeriod) foundPeriod = true
        const next = stream.Next()!
        buffer.push(next.value)
        lastChar = next.value
      }
    }
    const value = buffer.join('')
    return { index, type, value }
  }

  private ConsumeQuoted(stream: CharStream): Token<string> {
    const buffer: string[] = []
    const clone = stream.Clone()!
    const first = clone.Next()!
    const index = first.index
    const open = first.value
    buffer.push(open)
    while (!clone.IsEmpty()) {
      const peek = clone.Peek()!
      if (peek.value === open) {
        const next = clone.Next()!
        buffer.push(next.value)
        break
      } else {
        const next = clone.Next()!
        buffer.push(next.value)
      }
    }
    // If the buffers last element doesn't match the
    // opening quote, then we only shift one from the
    // stream and return this character as a char.
    if (buffer[buffer.length - 1] !== open) {
      stream.Next()
      return { index, type: 'char', value: buffer[0] }
    }
    // If we did find the opening quote, then we shift
    // the buffer length from the stream and return a
    // quoted token.
    for (let i = 0; i < buffer.length; i++) stream.Next()
    return { index, type: 'quoted', value: buffer.join('') }
  }

  public *Generate(content: string): Generator<Token<string>> {
    const stream = new CharStream(content)
    while (!stream.IsEmpty()) {
      const { value } = stream.Peek()!
      if (this.IsAlpha(value)) {
        yield this.ConsumeWord(stream)
      } else if (this.IsNumeric(value)) {
        yield this.ConsumeNumber(stream)
      } else if (this.IsQuote(value)) {
        yield this.ConsumeQuoted(stream)
      } else if (this.IsWhitespace(value)) {
        yield this.ConsumeWhitespace(stream)
      } else if (this.IsTabspace(value)) {
        yield this.ConsumeTabspace(stream)
      } else if (this.IsNewline(value)) {
        yield this.ConsumeNewline(stream)
      } else if (this.IsReturn(value)) {
        yield this.ConsumeReturn(stream)
      } else yield this.ConsumeChar(stream)
    }
  }
}

// --------------------------------------------------------------
// TokenStream
// --------------------------------------------------------------

export class TokenStream {
  constructor(private readonly tokens: Token<string>[], private index: number = 0) {}

  public Reset() {
    this.index = 0
  }

  public IsEmpty(): boolean {
    return this.index >= this.tokens.length
  }

  public Peek(): Token<string> {
    return this.tokens[this.index]
  }

  public Next(): Token<string> {
    return this.tokens[this.index++]
  }

  public Clone(): TokenStream {
    return new TokenStream(this.tokens, this.index)
  }

  public Rest() {
    return [...this.tokens.slice(this.index)]
  }

  public static Create(content: string, ignore: TokenType[] = ['whitespace', 'tabspace', 'newline', 'return']): TokenStream {
    const generator = new TokenGenerator()
    const tokens = [...generator.Generate(content)].filter((token) => !ignore.includes(token.type))
    return new TokenStream(tokens, 0)
  }
}
