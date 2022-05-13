/*--------------------------------------------------------------------------

@sidewinder/server

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

type PatternTokenType = 'name' | 'string' | 'wildcard' | 'seperator'

interface PatternToken {
  type: PatternTokenType
  value: string
}

export class Pattern {
  private static validCharacters = '-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
  private static invalidCharacters = '?&'.split('')

  private readonly tokens: PatternToken[]
  private readonly regex: RegExp
  private readonly params: string[]

  constructor(private readonly pattern: string) {
    this.tokens = [...this.tokenizePattern(this.pattern)]
    this.regex = this.createRegex(this.tokens)
    this.params = this.createParams(this.tokens)
  }

  public match(pathname: string): Record<string, string> | undefined {
    const match = pathname.match(this.regex)
    if (!match) return undefined
    return this.params.reduce((acc, param, index) => {
      return { ...acc, [param]: match[index + 1] }
    }, {} as Record<string, string>)
  }

  private consumeValid(chars: string[]) {
    const output = [] as string[]
    while (chars.length > 0) {
      const char = chars.shift()!
      if (Pattern.validCharacters.includes(char)) {
        output.push(char)
      } else {
        chars.unshift(char)
        return output.join('')
      }
    }
    return output.join('')
  }

  private *tokenizePattern(pattern: string): Generator<PatternToken> {
    const chars = pattern.split('')
    while (chars.length > 0) {
      const char = chars.shift()!
      if (Pattern.invalidCharacters.includes(char)) {
        throw Error(`Illegal character '${char}' in pattern '${pattern}'`)
      } else if (char === '*') {
        yield { type: 'wildcard', value: char }
      } else if (char === ':') {
        yield { type: 'name', value: this.consumeValid(chars) }
      } else if (char === '/') {
        yield { type: 'seperator', value: char }
      } else {
        yield { type: 'string', value: [char, this.consumeValid(chars)].join('') }
      }
    }
  }

  private createRegex(tokens: PatternToken[]): RegExp {
    const compiled = tokens
      .map((token) => {
        switch (token.type) {
          case 'wildcard':
            return '[\\w-_:$]*'
          case 'name':
            return '([\\w-_:$]*)'
          case 'string':
            return token.value
          case 'seperator':
            return '/'
        }
      })
      .join('')
    return new RegExp(`^${compiled}$`)
  }

  private createParams(token: PatternToken[]): string[] {
    return token.filter((result) => result.type === 'name').map((result) => result.value)
  }
}
