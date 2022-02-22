/*--------------------------------------------------------------------------

@sidewinder/redis

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

import { TypeBuilder, TSchema, TObject, TString, TNumber } from '@sidewinder/type'
export * from '@sidewinder/type'

type DefinedOr<T, Or> = keyof T extends never ? Or : T

// --------------------------------------------------------------------------
// TDatabase
// --------------------------------------------------------------------------

export type ResolveListDefinition<Database extends TDatabase, Name> = Name extends keyof Database['lists'] ? Database['lists'][Name] extends TSchema ? Database['lists'][Name] : never : never
export type ResolveMapDefinition<Database extends TDatabase, Name> = Name extends keyof Database['maps'] ? Database['maps'][Name] extends TSchema ? Database['lists'][Name] : never : never
export type ResolveSetDefinition<Database extends TDatabase, Name> = Name extends keyof Database['sets'] ? Database['sets'][Name] extends TSchema ? Database['lists'][Name] : never : never

export interface TListDefinitions {
    [name: string | number | symbol]: TSchema
}
export interface TMapDefinitions {
    [name: string | number | symbol]: TSchema
}
export interface TSetDefinitions {
    [name: string | number | symbol]: TString | TNumber
}

export interface TDatabaseOptions {
    /** List definitions */
    lists?: TListDefinitions
    /** Map definitions */
    maps?: TMapDefinitions
    /** Set definitions */
    sets?: TSetDefinitions
}

export interface TDatabase<DatabaseOptions extends TDatabaseOptions = TDatabaseOptions> extends TSchema {
    $static: {
        lists: DefinedOr<DatabaseOptions['lists'], TObject>,
        maps: DefinedOr<DatabaseOptions['maps'], TObject>,
        sets: DefinedOr<DatabaseOptions['sets'], TObject>,
    }
    type: 'object'
    kind: 'Database'
    lists: DefinedOr<DatabaseOptions['lists'], {}>,
    maps: DefinedOr<DatabaseOptions['maps'], {}>,
    sets: DefinedOr<DatabaseOptions['sets'], {}>,
}

// --------------------------------------------------------------------------
// RedisTypeBuilder
// --------------------------------------------------------------------------

export class RedisTypeBuilder extends TypeBuilder {
    public Database<DatabaseOptions extends TDatabaseOptions>(options: DatabaseOptions): TDatabase<DatabaseOptions> {
        const lists = options.lists || {}
        const maps = options.maps || {}
        const sets = options.sets || {}
        return this.Create({ type: 'object', kind: 'Database', lists, maps, sets })
    }
}

export const Type = new RedisTypeBuilder()