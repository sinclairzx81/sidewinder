import * as resolve from './resolve'
import { MongoDatabase, MongoCollection } from '@sidewinder/mongo'
import { Assert } from '../assert/index'

describe('mongo/Cursor', () => {
  async function createTestData(database: MongoDatabase, collection: MongoCollection<any>) {
    await collection.insertMany([
      { _id: database.id(), x: 1, y: 2, z: 0 }, // 0
      { _id: database.id(), x: 1, y: 2, z: 1 }, // 1
      { _id: database.id(), x: 1, y: 2, z: 2 }, // 2
      { _id: database.id(), x: 1, y: 2, z: 3 }, // 3
      { _id: database.id(), x: 1, y: 2, z: 4 }, // 4
      { _id: database.id(), x: 1, y: 2, z: 5 }, // 5
      { _id: database.id(), x: 1, y: 2, z: 6 }, // 6
      { _id: database.id(), x: 1, y: 2, z: 7 }, // 7
      { _id: database.id(), x: 1, y: 2, z: 8 }, // 8
      { _id: database.id(), x: 1, y: 2, z: 9 }, // 9
      { _id: database.id(), x: 1, y: 2, z: 10 }, // 10
      { _id: database.id(), x: 1, y: 2, z: 11 }, // 11
      { _id: database.id(), x: 1, y: 2, z: 12 }, // 12
      { _id: database.id(), x: 1, y: 2, z: 13 }, // 13
      { _id: database.id(), x: 1, y: 2, z: 14 }, // 14
      { _id: database.id(), x: 1, y: 2, z: 15 }, // 15
    ])
  }

  // -----------------------------------------------------------------------------
  // toArray
  // -----------------------------------------------------------------------------

  it(
    'should support toArray',
    resolve.database(async (database) => {
      const vectors = database.collection('vectors')
      await createTestData(database, vectors)

      const result = await vectors.find({}).toArray()
      Assert.equal(result.length, 16)
      let index = 0
      for (const value of result) {
        const { _id, x, y, z } = value
        Assert.isTypeOf(_id, 'string')
        Assert.deepEqual({ x, y, z }, { x: 1, y: 2, z: index })
        index += 1
      }
    }),
  )

  // -----------------------------------------------------------------------------
  // skip
  // -----------------------------------------------------------------------------

  it(
    'should support skip',
    resolve.database(async (database) => {
      const vectors = database.collection('vectors')
      await createTestData(database, vectors)

      const result = await vectors.find({}).skip(8).toArray()
      Assert.equal(result.length, 8)
      let index = 8
      for (const value of result) {
        const { _id, x, y, z } = value
        Assert.isTypeOf(_id, 'string')
        Assert.deepEqual({ x, y, z }, { x: 1, y: 2, z: index })
        index += 1
      }
    }),
  )

  // -----------------------------------------------------------------------------
  // take
  // -----------------------------------------------------------------------------

  it(
    'should support take',
    resolve.database(async (database) => {
      const vectors = database.collection('vectors')
      await createTestData(database, vectors)
      const result = await vectors.find({}).take(8).toArray()
      Assert.equal(result.length, 8)
      let index = 0
      for (const value of result) {
        const { _id, x, y, z } = value
        Assert.isTypeOf(_id, 'string')
        Assert.deepEqual({ x, y, z }, { x: 1, y: 2, z: index })
        index += 1
      }
    }),
  )

  // -----------------------------------------------------------------------------
  // skip and take
  // -----------------------------------------------------------------------------

  it(
    'should support skip and take',
    resolve.database(async (database) => {
      const vectors = database.collection('vectors')
      await createTestData(database, vectors)
      const result = await vectors.find({}).skip(4).take(8).toArray()
      Assert.equal(result.length, 8)
      let index = 4
      for (const value of result) {
        const { _id, x, y, z } = value
        Assert.isTypeOf(_id, 'string')
        Assert.deepEqual({ x, y, z }, { x: 1, y: 2, z: index })
        index += 1
      }
    }),
  )

  // -----------------------------------------------------------------------------
  // sort
  // -----------------------------------------------------------------------------

  it(
    'should support sort',
    resolve.database(async (database) => {
      const vectors = database.collection('vectors')
      await createTestData(database, vectors)
      const result = await vectors.find({}).sort({ z: -1 }).toArray()
      Assert.equal(result.length, 16)
      let index = 15
      for (const value of result) {
        const { _id, x, y, z } = value
        Assert.isTypeOf(_id, 'string')
        Assert.deepEqual({ x, y, z }, { x: 1, y: 2, z: index })
        index -= 1
      }
    }),
  )

  // -----------------------------------------------------------------------------
  // async iterator
  // -----------------------------------------------------------------------------

  it(
    'should support async iterator',
    resolve.database(async (database) => {
      const vectors = database.collection('vectors')
      await createTestData(database, vectors)
      const result: any[] = []
      for await (const value of await vectors.find({})) {
        result.push(value)
      }
      Assert.equal(result.length, 16)
      let index = 0
      for (const value of result) {
        const { _id, x, y, z } = value
        Assert.isTypeOf(_id, 'string')
        Assert.deepEqual({ x, y, z }, { x: 1, y: 2, z: index })
        index += 1
      }
    }),
  )
})
