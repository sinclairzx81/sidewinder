/*--------------------------------------------------------------------------

@sidewinder/mongo

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

import { Static, SchemaOptions, TObject, TypeBuilder } from '@sidewinder/contract'
import { matchArguments } from './arguments'

export type TCollections = Record<string, TObject>
export type TIndices = Record<string, any>

export interface TDatabase<
    Collections extends TCollections = TCollections,
    Indices extends TIndices = TIndices
    > {
    $static: { [K in keyof Collections['collections']]: Static<Collections['collections'][K]> }
    kind: 'Database'
    type: 'object'
    collections: Collections
    indices: Indices
}

export class DatabaseTypeBuilder extends TypeBuilder {
    /** Creates a database schematic with indices */
    public Database<Collections extends TCollections, Indices extends TIndices>(collections: Collections, indices: Indices): TDatabase<Collections, Indices>
    /** Creates a database schematic */
    public Database<Collections extends TCollections>(collections: Collections): TDatabase<Collections, {}>
    /** Creates a database schemaic */
    public Database(...args: any[]): any {
        return matchArguments(args, {
            2: (collections, indices) => this.Create({ kind: 'Database', type: 'object', collections, indices }),
            1: (collections) => this.Create({ kind: 'Database', type: 'object', collections, indices: {} }),
            _: () => { throw new Error('Invalid Database() arguments') }
        })
    }

    /** Creates a Mongo Identifier */
    public ObjectId(options: SchemaOptions = {}) {
        return super.RegEx(/^[0-9a-fA-F]{24}$/, options)
    }
}


export const Type = new DatabaseTypeBuilder()