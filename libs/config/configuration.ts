/*--------------------------------------------------------------------------

@sidewinder/config

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

import { TypeCompiler, TypeCheck } from '@sidewinder/type/compiler'
import { Static, TObject } from '@sidewinder/type'
import { ArgumentsResolver, DocumentResolver, EnvironmentResolver } from './resolvers/index'
import { Documentation } from './documentation/index'
import { JsonPointer } from './pointer/index'
import { Descriptors } from './descriptors/index'

export class ConfigurationResolver<T extends TObject> {
  private readonly environmentResolver: EnvironmentResolver
  private readonly argumentResolver: ArgumentsResolver
  private readonly documentResolver: DocumentResolver
  private readonly typecheck: TypeCheck<T>

  constructor(private readonly schema: T, private readonly env: object, private readonly argv: string[]) {
    this.environmentResolver = new EnvironmentResolver(this.env)
    this.argumentResolver = new ArgumentsResolver(this.argv)
    this.documentResolver = new DocumentResolver()
    this.typecheck = TypeCompiler.Compile(this.schema)
  }

  private exitWithResult(typecheck: TypeCheck<T>, object: unknown) {
    const red = '\x1b[91m'
    const gray = '\x1b[90m'
    const esc = `\x1b[0m`
    const documentation = Documentation.resolve(this.schema)
    console.log(documentation)
    console.log()
    console.log(`${red}Errors:${esc}`)
    console.log()
    for (const error of [...typecheck.Errors(object)]) {
      const cliname = '--' + error.path.slice(1).replace(/\//, '-').toLowerCase()
      const envname = error.path.slice(1).replace(/\//, '_').toUpperCase()
      console.log(`  ${gray}${cliname}${esc} ${envname} ${red}${error.message}${esc}`)
    }
    console.log()
    process.exit(1)
  }

  private shouldHelp() {
    return this.argv.includes('--help')
  }

  private resolveInitial(configFileOrObject?: string | object) {
    if (typeof configFileOrObject === 'string') {
      return this.documentResolver.resolve(configFileOrObject)
    }
    if (typeof configFileOrObject === 'object') {
      return configFileOrObject
    }
    return {}
  }

  /** Returns configuration help information as a string */
  public help() {
    return Documentation.resolve(this.schema)
  }

  /** Resolves the configuration object */
  public resolve(configFileOrObject?: string | Partial<Static<T>>): Static<T> {
    // Check for help
    if (this.shouldHelp()) {
      console.log(Documentation.resolve(this.schema))
      return process.exit(0) as never
    }

    // Resolve Initial
    const object = this.resolveInitial(configFileOrObject)

    // Resolve Defaults
    const defaultOptions = { format: (name: string) => name, prefix: '', seperator: '' }
    for (const descriptor of Descriptors.resolve(this.schema, defaultOptions)) {
      if (descriptor.default === undefined) continue
      JsonPointer.set(object, descriptor.pointer, descriptor.default)
    }

    // Resolve Environment Variables
    const environmentOptions = { format: (name: string) => name.toUpperCase(), prefix: '', seperator: '_' }
    for (const descriptor of Descriptors.resolve(this.schema, environmentOptions)) {
      const value = this.environmentResolver.resolve(descriptor)
      if (value === undefined) continue
      JsonPointer.set(object, descriptor.pointer, value)
    }

    // Resolve Command Line Arguments
    const argumentOptions = { format: (name: string) => name.toLowerCase(), prefix: '--', seperator: '-' }
    for (const descriptor of Descriptors.resolve(this.schema, argumentOptions)) {
      const value = this.argumentResolver.resolve(descriptor)
      if (value === undefined) continue
      JsonPointer.set(object, descriptor.pointer, value)
    }

    // Check Object
    if (this.typecheck.Check(object)) return object as Static<T>
    return this.exitWithResult(this.typecheck, object) as never
  }
}

/** Resolves Configuration from the Environment */
export function Configuration<Schema extends TObject>(schema: Schema): ConfigurationResolver<Schema> {
  return new ConfigurationResolver<Schema>(schema, process.env, process.argv.slice(2))
}
