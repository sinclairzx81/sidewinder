import * as resolve from './resolve'
import { Assert } from '../assert/index'
import { MongoCollection } from '@sidewinder/mongo'

describe('mongo/MongoDatabase', () => {
  it(
    'should return an identifier as 24 character hexstring',
    resolve.database((database) => {
      const id = database.id()
      Assert.equal(typeof id, 'string')
      Assert.equal(id.length, 24)
    }),
  )

  it(
    'should return collection types',
    resolve.database((database) => {
      const vectors_1 = database.collection('vectors')
      const vectors_2 = database.collection('vectors-no-id')
      Assert.isInstanceOf(vectors_1, MongoCollection)
      Assert.isInstanceOf(vectors_2, MongoCollection)
    }),
  )

  it(
    'should throw on returning unknown collection type',
    resolve.database((database) => {
      // @ts-ignore
      Assert.throws(() => database.collection('unknown'))
    }),
  )
})
