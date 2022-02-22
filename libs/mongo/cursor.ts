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

import { MongoEncoder } from './encoder'
import * as Mongo from 'mongodb'
import { matchArguments } from './arguments'

export class MongoCursor<T> {
    constructor(private readonly encoder: MongoEncoder, public readonly cursor: Mongo.FindCursor<Mongo.WithId<Mongo.Document>>) { }

    /** Asynchronous iterator for this Cursor */
    public async *[Symbol.asyncIterator]() {
        for (const value of await await this.toArray()) {
            yield value
        }
    }

    /** Returns a new uninitialized copy of this cursor, with options matching those that have been set on the current instance */
    public clone(): MongoCursor<T> {
        return new MongoCursor(this.encoder, this.cursor.clone())
    }

    /** Get the count of documents for this cursor */
    public count(options: Mongo.CountOptions): Promise<number>
    /** Get the count of documents for this cursor */
    public count(): Promise<number>
    /** Get the count of documents for this cursor */
    public count(...args: any): any {
        return matchArguments(args, {
            1: (options) => {
                return this.cursor.count(options)
            },
            0: () => {
                return this.cursor.count()
            },
            _: () => {
                throw new Error('Invalid count() arguments')
            }
        })
    }

    /** Set the cursor query */
    public filter(filter: Mongo.Document): MongoCursor<T> {
        return new MongoCursor(this.encoder, this.cursor.filter(filter))
    }

    /** Sets the sort order of the cursor query. */
    public sort(sort: Mongo.Sort | string, direction?: Mongo.SortDirection): MongoCursor<T> {
        return new MongoCursor(this.encoder, this.cursor.sort(sort, direction))
    }

    /** Set the limit for the cursor. */
    public take(value: number): MongoCursor<T> {
        return new MongoCursor(this.encoder, this.cursor.limit(value))
    }

    /** Set the skip for the cursor. */
    public skip(value: number): MongoCursor<T> {
        return new MongoCursor(this.encoder, this.cursor.skip(value))
    }

    /** Returns results as an array */
    public async toArray(): Promise<Array<T>> {
        const results = await this.cursor.toArray()
        return results.map(result => this.encoder.decode(result))
    }
}