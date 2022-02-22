import * as resolve from './resolve'
import * as assert from '../assert/index'

describe('mongo/MongoCollection', () => {

    // -----------------------------------------------------------------------------
    // insertOne
    // -----------------------------------------------------------------------------

    it('should insertOne', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const result = await vectors.insertOne({ _id: database.id(), x: 1, y: 2, z: 3 })
        assert.isTypeOf(result.insertedId, 'string')
    }))

    it('should insertOne with options', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const result = await vectors.insertOne({ _id: database.id(), x: 1, y: 2, z: 3 }, {})
        assert.isTypeOf(result.insertedId, 'string')
    }))

    it('should not insertOne with invalid document', resolve.database(async database => {
        const vectors = database.collection('vectors')
        // @ts-ignore
        await assert.throwsAsync(async () => await vectors.insertOne({ _id: database.id(), y: 2, z: 3 }, {}))
    }))

    // -----------------------------------------------------------------------------
    // insertMany
    // -----------------------------------------------------------------------------

    it('should insertMany', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const result = await vectors.insertMany([
            { _id: database.id(), x: 1, y: 2, z: 3 },
            { _id: database.id(), x: 1, y: 2, z: 3 },
            { _id: database.id(), x: 1, y: 2, z: 3 }
        ])
        assert.equal(result.insertedCount, 3)
    }))

    it('should insertMany with options', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const result = await vectors.insertMany([
            { _id: database.id(), x: 1, y: 2, z: 3 },
            { _id: database.id(), x: 1, y: 2, z: 3 },
            { _id: database.id(), x: 1, y: 2, z: 3 }
        ], {})
        assert.equal(result.insertedCount, 3)
    }))

    it('should not insertMany with invalid document', resolve.database(async database => {
        const vectors = database.collection('vectors')
        await assert.throwsAsync(async () => await vectors.insertMany([
            // @ts-ignore
            { _id: database.id(), y: 2, z: 3 }
        ]))
    }))

    // -----------------------------------------------------------------------------
    // updateOne
    // -----------------------------------------------------------------------------

    it('should updateOne', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        await vectors.insertOne({ _id: _id0, x: 1, y: 2, z: 3 })
        await vectors.insertOne({ _id: _id1, x: 1, y: 2, z: 3 })
        // only update _id0, expect _id1 unchanged
        await vectors.updateOne({ _id: _id0 }, { $set: { x: 7, y: 8, z: 9 } })
        const result0 = await vectors.findOne({ _id: _id0 })
        const result1 = await vectors.findOne({ _id: _id1 })
        assert.deepEqual(result0, { _id: _id0, x: 7, y: 8, z: 9 })
        assert.deepEqual(result1, { _id: _id1, x: 1, y: 2, z: 3 })
    }))

    it('should updateOne with options', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        await vectors.insertOne({ _id: _id0, x: 1, y: 2, z: 3 })
        await vectors.insertOne({ _id: _id1, x: 1, y: 2, z: 3 })
        // only update _id0, expect _id1 unchanged
        await vectors.updateOne({ _id: _id0 }, { $set: { x: 7, y: 8, z: 9 } }, {})
        const result0 = await vectors.findOne({ _id: _id0 })
        const result1 = await vectors.findOne({ _id: _id1 })
        assert.deepEqual(result0, { _id: _id0, x: 7, y: 8, z: 9 })
        assert.deepEqual(result1, { _id: _id1, x: 1, y: 2, z: 3 })
    }))

    it('should updateOne with upsert', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id = database.id()
        await vectors.updateOne({ _id }, { $set: { x: 1, y: 2, z: 3 } }, { upsert: true })
        const result = await vectors.findOne({})
        // issue: mongo-mock ignores identifier passed on upsert and generates a new one.
        // so here we just test that a single record has been written. For additional info
        // see: https://github.com/williamkapke/mongo-mock/issues/152
        const { x, y, z } = result!
        const result2 = { x, y, z }
        assert.deepEqual(result2, { x: 1, y: 2, z: 3 })
    }))

    it('should not updateOne with invalid document', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        await vectors.insertOne({ _id: _id0, x: 1, y: 2, z: 3 })
        await assert.throwsAsync(async () => await vectors.updateOne({ _id: _id0 }, { $set: { x: 7, y: 8, z: 9, w: 1 } }))
    }))

    it('should not updateOne with partial document on upsert', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        await assert.throwsAsync(async () => await vectors.updateOne({ _id: _id0 }, { $set: { _id: _id0, x: 7, y: 8 } }, { upsert: true }))
    }))

    // -----------------------------------------------------------------------------
    // updateMany
    // -----------------------------------------------------------------------------

    it('should updateMany', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        const _id2 = database.id()
        await vectors.insertOne({ _id: _id0, x: 1, y: 2, z: 3 })
        await vectors.insertOne({ _id: _id1, x: 1, y: 2, z: 3 })
        await vectors.insertOne({ _id: _id2, x: 1, y: 2, z: 3 })
        // update _id0 and _id1, expect _id2 unchanged
        await vectors.updateMany({ $or: [{ _id: _id0 }, { _id: _id1 }] }, { $set: { x: 7, y: 8, z: 9 } })
        const result0 = await vectors.findOne({ _id: _id0 })
        const result1 = await vectors.findOne({ _id: _id1 })
        const result2 = await vectors.findOne({ _id: _id2 })
        assert.deepEqual(result0, { _id: _id0, x: 7, y: 8, z: 9 })
        assert.deepEqual(result1, { _id: _id1, x: 7, y: 8, z: 9 })
        assert.deepEqual(result2, { _id: _id2, x: 1, y: 2, z: 3 })
    }))

    it('should updateMany with options', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        const _id2 = database.id()
        await vectors.insertOne({ _id: _id0, x: 1, y: 2, z: 3 })
        await vectors.insertOne({ _id: _id1, x: 1, y: 2, z: 3 })
        await vectors.insertOne({ _id: _id2, x: 1, y: 2, z: 3 })
        // update _id0 and _id1, expect _id2 unchanged
        await vectors.updateMany({ $or: [{ _id: _id0 }, { _id: _id1 }] }, { $set: { x: 7, y: 8, z: 9 } }, {})
        const result0 = await vectors.findOne({ _id: _id0 })
        const result1 = await vectors.findOne({ _id: _id1 })
        const result2 = await vectors.findOne({ _id: _id2 })
        assert.deepEqual(result0, { _id: _id0, x: 7, y: 8, z: 9 })
        assert.deepEqual(result1, { _id: _id1, x: 7, y: 8, z: 9 })
        assert.deepEqual(result2, { _id: _id2, x: 1, y: 2, z: 3 })
    }))

    it('should not updateMany with invalid document', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        await vectors.insertOne({ _id: _id0, x: 1, y: 2, z: 3 })
        await vectors.insertOne({ _id: _id1, x: 1, y: 2, z: 3 })
        await assert.throwsAsync(async () => await vectors.updateMany({ $or: [{ _id: _id0 }, { _id: _id1 }] }, { $set: { x: 7, y: 8, z: 9, w: 1 } }))
    }))

    it('should not updateMany with partial document on upsert', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        await assert.throwsAsync(async () => await vectors.updateMany({ $or: [{ _id: _id0 }, { _id: _id1 }] }, { $set: { _id: _id0, x: 7, y: 8 } }, { upsert: true }))
    }))

    // -----------------------------------------------------------------------------
    // deleteOne
    // -----------------------------------------------------------------------------

    it('should deleteOne with _id', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        const _id2 = database.id()
        await vectors.insertMany([
            { _id: _id0, x: 1, y: 2, z: 3 },
            { _id: _id1, x: 1, y: 2, z: 3 },
            { _id: _id2, x: 1, y: 2, z: 3 }
        ])
        const deleteResult = await vectors.deleteOne({ _id: _id0 })
        assert.equal(deleteResult.deletedCount, 1)
        const count = await vectors.count()
        assert.equal(count, 2)
        const result1 = await vectors.findOne({ _id: _id1 })
        const result2 = await vectors.findOne({ _id: _id2 })
        assert.deepEqual(result1, { _id: _id1, x: 1, y: 2, z: 3 })
        assert.deepEqual(result2, { _id: _id2, x: 1, y: 2, z: 3 })
    }))

    it('should deleteOne with common property', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        const _id2 = database.id()
        await vectors.insertMany([
            { _id: _id0, x: 1, y: 2, z: 3 },
            { _id: _id1, x: 1, y: 2, z: 3 },
            { _id: _id2, x: 1, y: 2, z: 3 }
        ])
        const deleteResult = await vectors.deleteOne({ z: 3 })
        assert.equal(deleteResult.deletedCount, 1)
        const count = await vectors.count()
        assert.equal(count, 2)
        const result1 = await vectors.findOne({ _id: _id1 })
        const result2 = await vectors.findOne({ _id: _id2 })
        assert.deepEqual(result1, { _id: _id1, x: 1, y: 2, z: 3 })
        assert.deepEqual(result2, { _id: _id2, x: 1, y: 2, z: 3 })
    }))

    // -----------------------------------------------------------------------------
    // deleteMany
    // -----------------------------------------------------------------------------

    it('should deleteMany with _id', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        const _id2 = database.id()
        await vectors.insertMany([
            { _id: _id0, x: 1, y: 2, z: 3 },
            { _id: _id1, x: 1, y: 2, z: 3 },
            { _id: _id2, x: 1, y: 2, z: 3 }
        ])
        const deleteResult = await vectors.deleteMany({ $or: [{ _id: _id0 }, { _id: _id1 }] })
        assert.equal(deleteResult.deletedCount, 2)
    }))

    // -----------------------------------------------------------------------------
    // count
    // -----------------------------------------------------------------------------

    it('should return document counts', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        const _id2 = database.id()
        await vectors.insertMany([
            { _id: _id0, x: 1, y: 2, z: 3 },
            { _id: _id1, x: 1, y: 2, z: 3 },
            { _id: _id2, x: 1, y: 2, z: 3 }
        ])
        const count = await vectors.count()
        assert.equal(count, 3)
    }))

    // -----------------------------------------------------------------------------
    // findOne
    // -----------------------------------------------------------------------------

    it('should findOne', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        const _id2 = database.id()
        await vectors.insertMany([
            { _id: _id0, x: 1, y: 2, z: 3 },
            { _id: _id1, x: 4, y: 5, z: 6 },
            { _id: _id2, x: 7, y: 8, z: 9 }
        ])
        const result0 = await vectors.findOne({ _id: _id0 })
        const result1 = await vectors.findOne({ _id: _id1 })
        const result2 = await vectors.findOne({ _id: _id2 })
        assert.deepEqual(result0, { _id: _id0, x: 1, y: 2, z: 3 })
        assert.deepEqual(result1, { _id: _id1, x: 4, y: 5, z: 6 })
        assert.deepEqual(result2, { _id: _id2, x: 7, y: 8, z: 9 })
    }))


    it('should findOne with option', resolve.database(async database => {
        const vectors = database.collection('vectors')
        const _id0 = database.id()
        const _id1 = database.id()
        const _id2 = database.id()
        await vectors.insertMany([
            { _id: _id0, x: 1, y: 2, z: 3 },
            { _id: _id1, x: 4, y: 5, z: 6 },
            { _id: _id2, x: 7, y: 8, z: 9 }
        ])
        const result0 = await vectors.findOne({ _id: _id0 }, {})
        const result1 = await vectors.findOne({ _id: _id1 }, {})
        const result2 = await vectors.findOne({ _id: _id2 }, {})
        assert.deepEqual(result0, { _id: _id0, x: 1, y: 2, z: 3 })
        assert.deepEqual(result1, { _id: _id1, x: 4, y: 5, z: 6 })
        assert.deepEqual(result2, { _id: _id2, x: 7, y: 8, z: 9 })
    }))
})