<div align='center'>

<h1>Sidewinder Hash</h1>

<p>Sidewinder Hashing Functions</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/hash?label=%40sidewinder%2Fhash">](https://www.npmjs.com/package/@sidewinder/hash)

</div>

## Overview

This package contains hashing utility functions used to compute hashes for various data. It implements timing safe compare for each function, and selects appropriate algorithms for the data being hashed.

License MIT

## ValueHash

The ValueHash utility will generate a sha1 hash of any valid JavaScript value. This utility uses the `object-hash` package internally.

```typescript
import { ValidHash } from '@sidewinder/hash'

const value = {
  a: 1,
  b: true,
  c: 'hello',
}

const hash = ValueHash.hash(value)

const same = ValueHash.compare(value, hash) // true
```

## PasswordHash

The PasswordHash utility will generate a bcrypt cryptographic hash of a given string. This utility uses the `bcryptjs` package internally and it's functions are asynchronous.

```typescript
import { PasswordHash } from '@sidewinder/hash'

const password = '<password-credential-here>'

const hash = await PasswordHash.hash(value)

const same = await PasswordHash.compare(value, hash) // true
```
