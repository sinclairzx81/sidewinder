import * as resolve from './resolve'
import * as assert from '../assert/index'
import { MongoCollection } from '@sidewinder/mongo'

describe('mongo/MongoDatabase', () => {
    it('should return an identifier as 24 character hexstring', resolve.database(database => {
        const id = database.id()
        assert.equal(typeof id, 'string')
        assert.equal(id.length, 24)
    }))

    it('should return collection types', resolve.database(database => {
        const vectors_1 = database.collection('vectors')
        const vectors_2 = database.collection('vectors-no-id')
        assert.isInstanceOf(vectors_1, MongoCollection)
        assert.isInstanceOf(vectors_2, MongoCollection)
    }))
    
    it('should throw on returning unknown collection type', resolve.database(database => {
        // @ts-ignore
        assert.throws(() => database.collection('unknown'))
    }))
})