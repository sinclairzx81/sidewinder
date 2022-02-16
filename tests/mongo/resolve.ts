import type { MongoClient, Db } from 'mongodb'

const mongo_mock = require('mongo-mock')
mongo_mock.max_delay = 5

// -------------------------------------------------------------
// Db Resolver: Resolves a unique database each pass
// -------------------------------------------------------------

export function db(callback: (db: Db) => Promise<void> | void) {
    return async () => {
        const client = new mongo_mock.MongoClient()
        const db = await client.connect(`mongodb://localhost:27017/${mongo_mock.ObjectId().toHexString()}`)
        try {
            await callback(db)
            await db.close()
        } catch (error) {
            await db.close()
            throw error
        }
    }
}

// -------------------------------------------------------------
// Common Database Structure
// -------------------------------------------------------------

import { Database, Type } from '@sidewinder/mongo'

const Vector = Type.Object({
    _id: Type.ObjectId(),
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number()
}, { additionalProperties: false })

const VectorNoID = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number()
}, { additionalProperties: false })

const Schema = Type.Database({
    'vectors': Vector,
    'vectors-no-id': VectorNoID
})

export function database(callback: (db: Database<typeof Schema>) => Promise<void> | void) {
    return async () => db(async db => {
        const database: any = new Database(Schema, db)
        await callback(database)
    })()
}