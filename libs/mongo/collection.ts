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

import * as Mongo from 'mongodb'
import { Validator } from '@sidewinder/validator'
import { Type, TObject, TPartial, TProperties, Static } from './type'
import { MongoCursor } from './cursor'
import { MongoEncoder } from './encoder'
import { matchArguments } from './arguments'

export class MongoCollection<T extends TObject<TProperties> = TObject<TProperties>> {
  private readonly validatePartial: Validator<TPartial<T>>
  private readonly validate: Validator<T>
  private readonly encoder: MongoEncoder

  constructor(public readonly schema: T, public readonly collection: Mongo.Collection) {
    // Note: Omit the partial schemas $id to prevent primary schema compile overlap
    const { $id, ...partialSchema } = schema as TObject
    this.validatePartial = new Validator(Type.Partial(partialSchema))
    this.validate = new Validator(schema)
    this.encoder = new MongoEncoder(schema)
  }

  /** Counts the number of documents in this collection. Internally uses countDocuments() */
  public count(filter: Mongo.Filter<Static<T>>, options: Mongo.CountDocumentsOptions): Promise<number>
  /** Counts the number of documents in this collection. Internally uses countDocuments() */
  public count(filter: Mongo.Filter<Static<T>>): Promise<number>
  /** Counts the number of documents in this collection. Internally uses countDocuments() */
  public count(): Promise<number>
  /** Counts the number of documents in this collection. Internally uses countDocuments() */
  public count(...args: any[]): Promise<number> {
    return matchArguments(args, {
      2: (filter, options) => {
        return this.collection.countDocuments(this.encoder.encode(filter), options)
      },
      1: (filter) => {
        return this.collection.countDocuments(this.encoder.encode(filter))
      },
      0: () => {
        return this.collection.countDocuments()
      },
      _: () => {
        throw new Error('Invalid count() arguments')
      },
    })
  }

  /** The name of the database this collection belongs to */
  public async deleteMany(filter: Mongo.Filter<Static<T>>): Promise<Mongo.DeleteResult> {
    const result = await this.collection.deleteMany(this.encoder.encode(filter))
    return this.encoder.decode(result)
  }

  /** Delete a document from a collection */
  public async deleteOne(filter: Mongo.Filter<Static<T>>): Promise<Mongo.DeleteResult> {
    const result = await this.collection.deleteOne(this.encoder.encode(filter))
    return this.encoder.decode(result)
  }

  /** The distinct command returns a list of distinct values for the given key across a collection. */
  public distinct<K extends keyof Static<T>>(key: K): Promise<Array<Static<T>[K]>> {
    return this.collection.distinct(key as string)
  }

  /** Drop the collection from the database, removing it permanently. New accesses will create a new collection. */
  public drop() {
    return this.collection.drop()
  }

  /** Creates a cursor for a filter that can be used to iterate over results from MongoDB */
  public find(filter: Mongo.Filter<Static<T>>, options: Mongo.FindOptions): MongoCursor<Static<T>>
  /** Creates a cursor for a filter that can be used to iterate over results from MongoDB */
  public find(filter: Mongo.Filter<Static<T>>): MongoCursor<Static<T>>
  /** Creates a cursor for a filter that can be used to iterate over results from MongoDB */
  public find(): MongoCursor<Static<T>>
  /** Creates a cursor for a filter that can be used to iterate over results from MongoDB */
  public find(...args: any[]): MongoCursor<Static<T>> {
    return matchArguments(args, {
      2: (filter, options) => {
        return new MongoCursor(this.encoder, this.collection.find(this.encoder.encode(filter), options))
      },
      1: (filter) => {
        return new MongoCursor(this.encoder, this.collection.find(this.encoder.encode(filter)))
      },
      0: () => {
        return new MongoCursor(this.encoder, this.collection.find({}))
      },
      _: () => {
        throw new Error('Invalid find() arguments')
      },
    })
  }

  /** Fetches the first document that matches the filter */
  public findOne(filter: Mongo.Filter<Static<T>>, options?: Mongo.FindOptions): Promise<Static<T> | null>
  /** Fetches the first document that matches the filter */
  public findOne(filter: Mongo.Filter<Static<T>>): Promise<Static<T> | null>
  /** Fetches the first document that matches the filter */
  public findOne(): Promise<Static<T> | null>
  /** Fetches the first document that matches the filter */
  public async findOne(...args: any[]) {
    return matchArguments(args, {
      2: async (filter, options) => {
        const result = await this.collection.findOne(this.encoder.encode(filter), options)
        return this.encoder.decode(result)
      },
      1: async (filter) => {
        const result = await this.collection.findOne(this.encoder.encode(filter))
        return this.encoder.decode(result)
      },
      0: async () => {
        const result = await this.collection.findOne({})
        return this.encoder.decode(result)
      },
      _: () => {
        throw new Error('Invalid findOne() arguments')
      },
    })
  }

  /** Find a document and delete it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndDelete(filter: Mongo.Filter<Static<T>>, options: Mongo.FindOneAndDeleteOptions): Promise<Mongo.ModifyResult<Static<T>>>
  /** Find a document and delete it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndDelete(filter: Mongo.Filter<Static<T>>): Promise<Mongo.ModifyResult<Static<T>>>
  /** Find a document and delete it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndDelete(...args: any[]): any {
    return matchArguments(args, {
      2: async (filter, options) => {
        const result = await this.collection.findOneAndDelete(this.encoder.encode(filter), options)
        return this.encoder.decode(result)
      },
      1: async (filter) => {
        const result = this.collection.findOneAndDelete(this.encoder.encode(filter))
        return this.encoder.decode(result)
      },
      _: () => {
        throw new Error('Invalid findOneAndDelete() arguments')
      },
    })
  }

  /** Find a document and replace it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndReplace(filter: Mongo.Filter<Static<T>>, replacement: Mongo.WithoutId<Static<T>>, options: Mongo.FindOneAndReplaceOptions): Promise<Mongo.ModifyResult<Static<T>>>
  /** Find a document and replace it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndReplace(filter: Mongo.Filter<Static<T>>, replacement: Mongo.WithoutId<Static<T>>): Promise<Mongo.ModifyResult<Static<T>>>
  /** Find a document and replace it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndReplace(...args: any[]): any {
    return matchArguments(args, {
      3: async (filter, replacement, options) => {
        const result = await this.collection.findOneAndReplace(this.encoder.encode(filter), this.encoder.encode(replacement), options)
        return this.encoder.decode(result)
      },
      2: async (filter, replacement) => {
        const result = await this.collection.findOneAndReplace(this.encoder.encode(filter), this.encoder.encode(replacement))
        return this.encoder.decode(result)
      },
      _: () => {
        throw new Error('Invalid findOneAndReplace() arguments')
      },
    })
  }

  /** Find a document and update it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndUpdate(filter: Mongo.Filter<Static<T>>, update: Mongo.UpdateFilter<Static<T>>, options: Mongo.FindOneAndUpdateOptions): Promise<Mongo.ModifyResult<Static<T>>>
  /** Find a document and update it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndUpdate(filter: Mongo.Filter<Static<T>>, update: Mongo.UpdateFilter<Static<T>>): Promise<Mongo.ModifyResult<Static<T>>>
  /** Find a document and update it in one atomic operation. Requires a write lock for the duration of the operation. */
  public findOneAndUpdate(...args: any[]): any {
    return matchArguments(args, {
      3: async (filter, update, options) => {
        this.validateUpdate(filter, update, options)
        const result = await this.collection.findOneAndUpdate(this.encoder.encode(filter), this.encoder.encode(update), options)
        return this.encoder.decode(result)
      },
      2: async (filter, update) => {
        this.validateUpdate(filter, update)
        const result = await this.collection.findOneAndUpdate(this.encoder.encode(filter), this.encoder.encode(update))
        return this.encoder.decode(result)
      },
      _: () => {
        throw new Error('Invalid findOneAndUpdate() arguments')
      },
    })
  }

  /** Inserts an array of documents into MongoDB. If documents passed in do not contain the _id field, one will be added to each of the documents missing it by the driver, mutating the document. This behavior can be overridden by setting the forceServerObjectId flag. */
  public insertMany(documents: Static<T>[], options: Mongo.BulkWriteOptions): Promise<Mongo.InsertManyResult<Static<T>>>
  /** Inserts an array of documents into MongoDB. If documents passed in do not contain the _id field, one will be added to each of the documents missing it by the driver, mutating the document. This behavior can be overridden by setting the forceServerObjectId flag. */
  public insertMany(documents: Static<T>[]): Promise<Mongo.InsertManyResult<Static<T>>>
  /** Inserts an array of documents into MongoDB. If documents passed in do not contain the _id field, one will be added to each of the documents missing it by the driver, mutating the document. This behavior can be overridden by setting the forceServerObjectId flag. */
  public insertMany(...args: any[]): any {
    return matchArguments(args, {
      2: async (documents, options) => {
        documents.forEach((document: any) => this.validate.assert(document))
        const inserts = documents.map((doc: unknown) => this.encoder.encode(doc))
        const result = await this.collection.insertMany(inserts, options)
        return this.encoder.decode(result)
      },
      1: async (documents) => {
        documents.forEach((document: any) => this.validate.assert(document))
        const inserts = documents.map((doc: unknown) => this.encoder.encode(doc))
        const result = await this.collection.insertMany(inserts)
        return this.encoder.decode(result)
      },
      _: () => {
        throw new Error('Invalid insertMany() arguments')
      },
    })
  }

  /** Inserts a single document into MongoDB. If documents passed in do not contain the _id field, one will be added to each of the documents missing it by the driver, mutating the document. This behavior can be overridden by setting the forceServerObjectId flag. */
  public insertOne(document: Static<T>, options: Mongo.InsertOneOptions): Promise<Mongo.InsertOneResult<Static<T>>>
  /** Inserts a single document into MongoDB. If documents passed in do not contain the _id field, one will be added to each of the documents missing it by the driver, mutating the document. This behavior can be overridden by setting the forceServerObjectId flag. */
  public insertOne(document: Static<T>): Promise<Mongo.InsertOneResult<Static<T>>>
  /** Inserts a single document into MongoDB. If documents passed in do not contain the _id field, one will be added to each of the documents missing it by the driver, mutating the document. This behavior can be overridden by setting the forceServerObjectId flag. */
  public insertOne(...args: any[]): any {
    return matchArguments(args, {
      2: async (document, options) => {
        this.validate.assert(document)
        const result = await this.collection.insertOne(this.encoder.encode(document), options)
        return this.encoder.decode(result)
      },
      1: async (document) => {
        this.validate.assert(document)
        const result = await this.collection.insertOne(this.encoder.encode(document))
        return this.encoder.decode(result)
      },
      _: () => {
        throw new Error('Invalid insertOne() arguments')
      },
    })
  }

  /** Update multiple documents in a collection */
  public updateMany(filter: Mongo.Filter<Static<T>>, update: Mongo.UpdateFilter<Static<T>>, options: Mongo.UpdateOptions): Promise<Mongo.UpdateResult | Mongo.Document>
  /** Update multiple documents in a collection */
  public updateMany(filter: Mongo.Filter<Static<T>>, update: Mongo.UpdateFilter<Static<T>>): Promise<Mongo.UpdateResult | Mongo.Document>
  /** Update multiple documents in a collection */
  public updateMany(...args: any[]): any {
    return matchArguments(args, {
      3: (filter, update, options) => {
        this.validateUpdate(filter, update, options)
        return this.collection.updateMany(this.encoder.encode(filter), this.encoder.encode(update), options)
      },
      2: (filter, update) => {
        this.validateUpdate(filter, update)
        return this.collection.updateMany(this.encoder.encode(filter), this.encoder.encode(update))
      },
      _: () => {
        throw new Error('Invalid updateMany() arguments')
      },
    })
  }

  /** Update a single document in a collection */
  public updateOne(filter: Mongo.Filter<Static<T>>, update: Mongo.UpdateFilter<Static<T>> | Partial<Static<T>>, options: Mongo.UpdateOptions): Promise<Mongo.UpdateResult>
  /** Update a single document in a collection */
  public updateOne(filter: Mongo.Filter<Static<T>>, update: Mongo.UpdateFilter<Static<T>> | Partial<Static<T>>): Promise<Mongo.UpdateResult>
  /** Update a single document in a collection */
  public updateOne(...args: any[]): any {
    return matchArguments(args, {
      3: (filter, update, options) => {
        this.validateUpdate(filter, update, options)
        return this.collection.updateOne(this.encoder.encode(filter), this.encoder.encode(update), options)
      },
      2: (filter, update) => {
        this.validateUpdate(filter, update)
        return this.collection.updateOne(this.encoder.encode(filter), this.encoder.encode(update))
      },
      _: () => {
        throw new Error('Invalid updateOne() arguments')
      },
    })
  }

  private validateUpdate(filter: Mongo.Filter<Static<T>>, updateFilter: Mongo.UpdateFilter<Static<T>>, options: Mongo.UpdateOptions = {}) {
    for (const update of Object.values(updateFilter)) {
      if (options.upsert === true) {
        // Note: Must validate against filter and update on upsert to ensure complete document.
        this.validate.assert({ ...filter, ...update })
      } else {
        this.validatePartial.assert(update)
      }
    }
  }
}
