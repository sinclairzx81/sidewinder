<div align='center'>

<h1>Sidewinder Mongo</h1>

<p>Type Safe interface for the NodeJS Mongo Driver</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/mongo?label=%40sidewinder%2Fmongo">](https://www.npmjs.com/package/@sidewinder/mongo)

</div>

## Overview

This package provides a thin type safe layer over the [official mongodb driver](https://www.npmjs.com/package/mongodb) package for NodeJS. It enables document models to be created with Sidewinder Types with each document strictly data checked via JSON schema prior to writing to MongoDB. In addition, this package provides automatic `ObjectId` and binary data encode and decode to and from MongoDB. This allows applications to treat Mongo identifiers as validated hex strings and Mongo `Binary` objects as `Uint8Array`.

License MIT

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [ObjectId](#ObjectId)

## Example

[TypeScript Example Link](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgWQgOwOYQCIEMa4BGuAzgKYA0cAKgJ5hlwC+cAZlBCHAOQACJwACZkA7sDTCoAehDos3AFChIsRCjkQAwgBtgZNPBbtOPWZgiDCihVKlwAtI6fOXrt+4+fHNu6nM69Ax8HL1Cw8NcFBQBjdBJ4aN19eABeODRRdX8kgwAKbjMsSwAuW20IaNxtAAsIeOKAJgB2AAYARiapS24ASgVcEVxgBJyYADpYtAzomFy+4IjFpY9gvAJicjgAZWjqshB8YGiF5dPTqMn4uABVcig4NLoGMYB5QgArMhnchAU4OAA+kJiv9QU8yK8Pl8YABJQRzCh-dK4EBkEFg+gQrYwKDiDAIpH7IbadE0TFjbG4zA-NjQA4wEHcInAbTcZg9RH-aJQMj4MiCEHgsYwgxkDBkKAE-4AVzAgj5ArJzxFMDFEoJTHml3gACUvtBBA8lRC3p9vr9-kDFaD-kLTdC4VLAdK7lbBeT7TNHRykdzearrUKVWrJT6ZXKFeig6LxaHOXAAG5VaVom1CgBy0pAhHVPs1Fzi8B2ewORqFayIpDIPyRLolJBBtwl8Z5sSgggbcD1bcEiPzJzOg-Cq3wlfIA6Hk5WMULcHl6yrRoyIiyWArG2rxaJVESgXGljm81sISnp8ix5FdxgE7Pt4LaCudagVqN87HEKEcyiAyG8DfG4mCBtG0aFgHQfInxIXoxnEK8XgyGtLWBG04CfK14zQFFU1Bbh5QTMhuHjZkSRwvCyF4QROCGNBAJAQjfR5SM4DWCE0AgEQnVled+RBFixjYji83mH9hjnUcANiYDQPA7hWwNKCehgh8JRgZBcDQWhcgAbSRC1QTdMSF3IGD4TDfS0OQizeyRLlGIDXi+X49inXDbjFT4gSXMTZNUxaeMmHjPSkMVf8qxMryASskErPjWz-R45jHM8szXKYjznJS7ztBTEE2n8xEAF0jzsW9Su8Y9rgjVUbzKydv0GUTQuMySQJmMC0Agu4FLGLi+Xg6tdMBSzXSEZhApsuBiMZMjeAgGA9igexKIOcRaPom1evsxLVScwT8oUYqT1qqdggAMXEQQauOs570fO4jREv9xLClrpI67hIOg1gLv6mkDKs9komPa7T2CGFVSgPkrpBpYolYaA4EeuBcm1VD7ogVhDPfQCpLamTPsU76JB+TUxhIABrYAwFyFpFIIcnqzaWmekQJFjzGDmFCYIGSphodVjIEDquBvnB3q38sYkoDWpgdrOvraDhCFshfqQf6RsNTUgA)

The Sidewinder MongoDatabase provides a strict subset of the Mongo `Db` API. It accepts a Database schema as it's first argument and `Db` instance for its second. Callers can access a Type Safe Collection API that automatically validates documents based on the Sidewinder Types defined in the Database schema. For indexing MongoDB and specifying other configuration options, use the `Db` object.

```typescript
import { Type, MongoDatabase } from '@sidewinder/mongo'
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
  _id:     user_id,
  name:    'dave',
  email:   'dave@domain.com',
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

## ObjectId

Sidewinder Mongo does not use the MongoDB `ObjectId` to read and write `_id` fields to Mongo. Rather it detects the format of string values and automatically encodes to and from `ObjectId`. This allows `ObjectId` values to be transmitted across a network as strings without additional encoding to and from this type.

```typescript
const User = Type.Object({
  _id:  Type.ObjectId() // Is a string regex string validated for 24 character hex strings values
  name: Type.String()
})

const Schema = Type.Database({
  users: User
})

const database = new MongoDatabase(Schema, Db)

database.collection('users').insertOne({
  _id: database.id(),  // Generates a new 24 character hex string
  name: 'dave'
})
```

## Uint8Buffer

Sidewinder Mongo supports automatic encode and decode of JavaScript `Uint8Array` buffers only. This can be used to read and write binary property values into Mongo.

```typescript
const ImageSegment = Type.Object({
  _id: Type.ObjectId()    // Is a string regex string validated for 24 character hex strings values
  data: Type.Uint8Array()
})
const Schema = Type.Database({
  imageSegments: ImageSegment
})

const database = new MongoDatabase(Schema, Db)

database.collection('imageSegments').insertOne({
  _id:  database.id(),        // Generates a new 24 character hex string
  data: new Uint8Array(16384) // 16K image segment
})

```