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

import { MongoClient, Db, MongoClientOptions, ObjectId } from 'mongodb'
import { TDatabase } from './type'
import { MongoCollection } from './collection'

/** TypeSafe database with JSON Schema validation built in */
export class MongoDatabase<Schema extends TDatabase = TDatabase> {
  constructor(private readonly schema: Schema, public readonly db: Db) {}

  /** Generates a new 24 character mongo identifier string */
  public id(): string {
    const objectId = new ObjectId()
    return objectId.toHexString()
  }

  /** Returns a collection with the given name */
  public collection<CollectionName extends keyof Schema['collections']>(collectionName: CollectionName): MongoCollection<Schema['collections'][CollectionName]> {
    if (this.schema['collections'][collectionName as string] === undefined) throw new Error(`Collection name '${collectionName}' not defined in schema`)
    const schema = this.schema['collections'][collectionName as string]
    const collection = this.db.collection(collectionName as string)
    return new MongoCollection<Schema['collections'][CollectionName]>(schema as any, collection)
  }

  /** Opens a database with the given url and options. */
  public static async connect<Schema extends TDatabase = TDatabase>(schema: Schema, url: string, options?: MongoClientOptions | undefined): Promise<MongoDatabase<Schema>> {
    const client = new MongoClient(url, options)
    await client.connect()
    const database = await client.db()
    return new MongoDatabase<Schema>(schema, database)
  }
}
