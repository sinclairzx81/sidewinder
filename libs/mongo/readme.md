<div align='center'>

<h1>Sidewinder Mongo</h1>

<p>Sidewinder Mongo Client Library</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/client?label=%40sidewinder%2Fclient">](https://www.npmjs.com/package/@sidewinder/client)

</div>

## Overview

This package provides a type safe layer over the [official mongodb driver](https://www.npmjs.com/package/mongodb) package for NodeJS. It enables models to be created with Sidewinder Contract types with each model strictly data checked via JSON schema prior to writing to MongoDB. In addition, this package provides automatic `ObjectId` and binary data encode and decode to and from MongoDB. This allows applications to treat Mongo identifiers as validated hex strings and Mongo `Binary` objects as `Uint8Array`.

License MIT

## Contents

- [Overview](#Overview)
- [Example](#Example)

## Example

Sidewinder Mongo provides a strict validation layer directly over the Mongo `Db` object. It provides a subset Db functions that can safely be type checked and runtime validated. Users will first need to establish a connection to MongoDB then pass an instance of `client.db()` to the Database constructor along with associated schema.

```typescript
import { Database, Type } from '@sidewinder/mongo'
 
// -------------------------------------------------------
// Database Schema Definition
// -------------------------------------------------------

const User = Type.Object({
    _id:      Type.ObjectId(),
    username: Type.String(),
    email:    Type.String({ format: 'email' }),
    created:  Type.Integer(),
    updated:  Type.Integer(),
}, { additionalProperties: false })

const Record = Type.Object({
    _id:      Type.ObjectId(),
    _user_id: Type.ObjectId(),
    created:  Type.Integer(),
    updated:  Type.Integer(),
}, { additionalProperties: false })
 
const Schema = Type.Database({
    users:   User,
    records: Record
})

const database = new Database(Schema, client.db()) // some existing mongodb db instance
 
// -------------------------------------------------------
// Insert
// -------------------------------------------------------
 
await database.collection('users').insertOne({
    _id:       database.id(),
    created:   Date.now(),
    updated:   Date.now(),
    username: 'dave',
    email:    'dave@domain.com'
})
// -------------------------------------------------------
// Update
// -------------------------------------------------------
 
await database.collection('users').updateOne({ _id: '...' }, {
    _id:       database.id(),
    created:   Date.now(),
    updated:   Date.now(),
    username: 'dave',
    password: 'password',
    email:    'dave@domain.com'
})
 
// -------------------------------------------------------
// Delete
// -------------------------------------------------------
 
await database.collection('users').deleteOne({ _id: '...' })

// -------------------------------------------------------
// Find
// -------------------------------------------------------
 
const users = database.collection('users').find({ ... }).toArray()
 
// -------------------------------------------------------
// Iterate
// -------------------------------------------------------
 
for await(const user of database.collection('users').find({ ... })) {
    
    // ...
}
```