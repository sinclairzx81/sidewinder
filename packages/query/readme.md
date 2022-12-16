<div align='center'>

<h1>Sidewinder Query</h1>

<p>Mongo Query Expressions</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/path?label=%40sidewinder%2Fquery">](https://www.npmjs.com/package/@sidewinder/query)

</div>

## Overview

This package provides a query expression syntax for constructing mongo filters from JavaScript like expressions.

```typescript
import { Query } from '@sidewinder/query'

const Q = Query(`
    user_id === '6364ed67a7e953d089dbe23d' && (
        record.name === 'foo' ||
        record.desc === 'bar'
    )
`)

// const Q = {
//   "$and": [
//     {
//       "user_id": "6364ed67a7e953d089dbe23d"
//     },
//     {
//       "$or": [
//         {
//           "record.name": "foo"
//         },
//         {
//           "record.desc": "bar"
//         }
//       ]
//     }
//   ]
// }

const results = await collection.find(Q).toArray()
```
