<div align='center'>

<h1>Sidewinder Mongo</h1>

<p>Type Safe interface for the NodeJS Mongo Driver</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/mongo?label=%40sidewinder%2Fmongo">](https://www.npmjs.com/package/@sidewinder/mongo)

</div>

## Overview

This package provides a type safe layer over the [official mongodb driver](https://www.npmjs.com/package/mongodb) package for NodeJS. It enables document models to be created with Sidewinder Contract types with each document strictly data checked via JSON schema prior to writing to MongoDB. In addition, this package provides automatic `ObjectId` and binary data encode and decode to and from MongoDB. This allows applications to treat Mongo identifiers as validated hex strings and Mongo `Binary` objects as `Uint8Array`.

License MIT

## Contents

- [Overview](#Overview)
- [Example](#Example)

## Example

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgEQIY1QI1QZwKYA0cAKgJ5h5wC+cAZlBCHAOQACOwAJngO7AB23KAHoQEfgHMIzAFChIsRHACy4qQGEANsDz94NeoxZjJETplkzhwuAFp7Dx0+cvXb9-as3VprTr1edh7BIaHOMjIAxuI48JHauvAAvHD8vCpqEH6JABTMJlLmAFzWmhCRqJoAFhCxRQBMAOwADACMjcLmzACUMqg8qMBxCXoAdNH8aZEwOb2BYQuLboFoGNj4cADKkVV4IOjAkfNLJycRE7FwAKr4UHApZBSjAPKYAFZ40zkIMnB-cAB9LhFf5-R54F7vT4wACSnFmBF+-34qBAeBB-3Bo02MCgAgkCKRfz2g00GJI5AhOLxkm+dGg+xgIOYJOAmmY1G6iNBkSgeHQeE4IKxML0eAkeCghNBAFcwJwBUKKU9RTBxZLZjIqHMLvAAEqfaCce7KiGvD5fH6goFK0GmyEW2HwrlEwEy2424WUh3QuHS-68-lq20isUSqUu2XyxUY0Nq8P+v4AN0qMvRoKxADkZSBMBretrzjF4NtdvsTVjVlhcHhvq73ZKcOSbpLuf8+dEoJwm3ADZ3OFq5tYgqdR6EVuhq-hjmPZ+4i-xLgq1jWTWkeChJ+ta6WSUR4v4YKNzLMhzY5xfXIFRbcYDPLw-bAvLg2oDaTcupxCuJq+gMhnAn7buMECaJo0LAOIeSvjgPSjAIt7PGkdbWsCdpwK+Nptn8KJouSLAKkmeDMNhcCsmS-zMIReCsJwjCDPwIEgCRrqBjGm5qqM-AQDwiYYdGwYgqsELcbxBZzP0gzwEBNYgWBEFQcwHZGrB3TwYukowMoqD8KQOQANpWv8nroTJ+Dwc6pEAphaE2ZwpFsYJfzCVxPF8XKy6ChiLmiXxKaaGm+HNFqRBGX8Jl2mZ36Wa61kerZ8X2axfLsRxIluZG-wealPkZaR-mBaCrRagAumeI6PpegRXAJeD3pVc4RJJAFRXJ4HTJB-DQbcqmjNlapIbWSAmXZ1Cha65HklRqBEawEAwLsUC2HR+wCExLFRp5Sq5WJg4RPVDVjoEABiAgDsOh1VVExYYbcJrNdJW6ydE8kdYpMFwbQZ2DXSI2JZyEQXZdjXDjCapQAKB3A0sES0NAcAPTkuq3ZKcAQLQgFPeZL3tTAnXdY2n1nXS2qjDgADWwBgDkzRqRg5O1q0tPdIgESgsOoyc1qgPntDR3DsgeDgWqUN82ETX-o9K7Y6BuP48wH1qdwwt4D9w0JZK77akAA)

Sidewinder Mongo provides a strict validation layer directly over the Mongo `Db` object. It provides a subset the drivers `Db` functions that can safely checked and runtime validated. To use, users will first need to establish a connection to MongoDB via the driver then pass an instance of `client.db()` to the MongoDatabase constructor along with associated schema.

```typescript
import { MongoDatabase, Type } from '@sidewinder/mongo'
import { MongoClient } from 'mongodb'

// ---------------------------------------------------------
// MongoClient
// ---------------------------------------------------------

const client = new MongoClient('mongodb://localhost:27017/db')
await client.connect()

// ---------------------------------------------------------
// Database Schematic
// ---------------------------------------------------------

const User = Type.Object({
  _id:     Type.ObjectId(),
  name:    Type.String(),
  email:   Type.String({ format: 'email' }),
  created: Type.Integer(),
  updated: Type.Integer(),
})

const Record = Type.Object({
  _id:      Type.ObjectId(),
  _user_id: Type.ObjectId(),
  created:  Type.Integer(),
  updated:  Type.Integer(),
  value:    Type.Number(),
})

const Schema = Type.Database({
  users: User,
  records: Record,
})

// ---------------------------------------------------------
// Database
// ---------------------------------------------------------

const database = new MongoDatabase(Schema, client.db())

// ---------------------------------------------------------
// Insert
// ---------------------------------------------------------

const user_id = database.id()

await database.collection('users').insertOne({
  _id: user_id,
  name: 'dave',
  email: 'dave@domain.com',
  created: Date.now(),
  updated: Date.now(),
})

await database.collection('records').insertMany([
  {
    _id: database.id(),
    _user_id: user_id,
    created: Date.now(),
    updated: Date.now(),
    value: 0,
  },
  {
    _id: database.id(),
    _user_id: user_id,
    created: Date.now(),
    updated: Date.now(),
    value: 1,
  },
])

// ---------------------------------------------------------
// Update
// ---------------------------------------------------------

await database.collection('users').updateOne(
  { _id: user_id },
  {
    email: 'dave@other-domain.com',
    updated: Date.now(),
  },
)

// ---------------------------------------------------------
// Find
// ---------------------------------------------------------

const user = await database.collection('users').findOne({ _id: user_id })

// ---------------------------------------------------------
// Iterate
// ---------------------------------------------------------

for await (const user of database.collection('users').find({}).skip(0).take(10)) {
  // ...
}

// ---------------------------------------------------------
// Delete
// ---------------------------------------------------------

await database.collection('users').deleteOne({ _id: user_id })
```
