/*--------------------------------------------------------------------------

@sidewinder/config

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

import { Static, TObject } from '@sidewinder/type'
import { Value } from '@sidewinder/value'

// ------------------------------------------------------------------
// ConfigurationResolveParameter
// ------------------------------------------------------------------
export type ConfigurationResolveParameter = Record<any, unknown>
// ------------------------------------------------------------------
// ConfigurationResolver
// ------------------------------------------------------------------
export class ConfigurationResolver<T extends TObject> {
  constructor(private readonly schema: T) {}

  /** Resolves the configuration from the given value. Will terminate the process on error with exit code 1 */
  public resolve<Environment extends ConfigurationResolveParameter>(value: Environment): Static<T> {
    const resolved = this.#pipeline(value)
    return Value.Check(this.schema, resolved) ? resolved : this.#exit(resolved)
  }
  /** Resolves the configuration from the given value. Will throw if the value is invalid */
  public parse<Environment extends ConfigurationResolveParameter>(value: Environment): Static<T> {
    const resolved = this.#pipeline(value)
    return Value.Check(this.schema, resolved) ? resolved : this.#throw(resolved)
  }
  // ----------------------------------------------------------------
  // Internal
  // ----------------------------------------------------------------
  #pipeline<Environment extends ConfigurationResolveParameter>(value: Environment) {
    const clone = Value.Clone(value)
    const defaulted = Value.Default(this.schema, clone)
    const converted = Value.Convert(this.schema, defaulted)
    const cleaned = Value.Clean(this.schema, converted)
    return cleaned
  }
  #throw(value: unknown): never {
    throw new Error(`Invalid value ${JSON.stringify(value)}`)
  }
  #exit(value: unknown): never {
    const [red, gray, esc] = ['\x1b[91m', '\x1b[90m', `\x1b[0m`]
    console.log()
    console.log(`${gray}Configuration:${esc}`)
    console.log()
    const errormap = new Map<string, string[]>()
    for (const error of [...Value.Errors(this.schema, value)]) {
      const name = error.path.slice(1).replace(/\//g, '.')
      if (!errormap.has(name)) errormap.set(name, [])
      errormap.get(name)!.push(error.message)
    }
    for (const [name, errors] of errormap) {
      const property = `  ${name}`.padEnd(32)
      console.log(`${property} ${red}${errors.join(', ')}${esc}`)
    }
    console.log()
    process.exit(1)
  }
}

/** Creates a configuration resolver */
export function Configuration<Schema extends TObject>(schema: Schema): ConfigurationResolver<Schema> {
  return new ConfigurationResolver<Schema>(schema)
}
