<div align='center'>

<h1>Sidewinder Value</h1>

<p>Operations on dynamic JavaScript values</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/value?label=%40sidewinder%2Fvalue">](https://www.npmjs.com/package/@sidewinder/value)

</div>

<a name="Overview"></a>

## Overview

Sidewinder Value is a library that provides advanced operations on JavaScript values. It offers functionality ranging from creating values from Sidewinder types, upcasting values from types and diffing and patching values. All functions of this library are immutable.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Usage](#Usage)
- [Clone](#Clone)
- [Create](#Create)
- [Check](#Check)
- [Diff](#Diff)
- [Patch](#Patch)
- [Upcast](#Upcast)

## Install

```bash
$ npm install @sidewinder/value
```

## Clone

The clone function will deep clone a JavaScript value.

```typescript
import { Value } from '@sidewinder/value'

const A = Value.Clone(1) // 1
const B = Value.Clone(true) // true
const C = Value.Clone('hello') // hello
const D = Value.Clone([1, 2, 3]) // [1, 2, 3]
const E = Value.Clone({ x: 1, y: 1 }) // { x: 1, y: 1}
```

## Create

The create function will create a JavaScript value from a Sidewinder type. If the type provides a default value, this value will be used to create the associated value.

```typescript
import { Value, Type } from '@sidewinder/type'

const T = Type.Object({
  x: Type.Number({ default: 0 }),
  y: Type.Number({ default: 0 }),
  z: Type.Number({ default: 0 }),
  w: Type.Number({ default: 1 }),
})

// const value = { x: 0, y: 0, z: 0, w: 1 }
const value = Value.Create(T)
```

## Check

The check function performs a fast runtime type check on a given value. Note that this function checks based on the `kind` property of the type, and is not a JSON schema check.

```typescript
import { Value, Type } from '@sidewinder/type'

const T = Type.Object({
  x: Type.Number({ default: 0 }),
  y: Type.Number({ default: 0 }),
  z: Type.Number({ default: 0 }),
  w: Type.Number({ default: 1 }),
})

// const check = true
const check = Value.Check({ x: 1, y: 1, z: 1, w: 2 })
```

## Diff

The diff function will produce a series of operational edits to transform one value into another. This function is used with the patch function to apply patches to JavaScript values where.

```typescript
import { Value } from '@sidewinder/type'

const A = { x: 1, y: 1 }
const B = { x: 2, y: 2, z: 2 }

const E = Value.Diff(A, B) // Edit[]
```

## Patch

The diff function will produce a series of operational edits to transform one value into another. This function is used with the patch function to apply patches to JavaScript values where.

```typescript
import { Value } from '@sidewinder/type'
const A = { x: 1, y: 1 }
const B = { x: 2, y: 2, z: 2 }
const E = Value.Diff(A, B)
const C = Value.Patch(A, E)

assert.deepEqual(B, C)
```

## Upcast

The upcast function will attempt to cast an existing value to the target type while preserving as much information as possible.

```typescript
import { Value, Type } from '@sidewinder/type'

const T = Type.Object({
  id: Type.String()
  x: Type.Number({ default: 0 }),
  y: Type.Number({ default: 0 }),
  z: Type.Number({ default: 0 }),
})

// const value = { id: '', x: 1, y: 1, z: 1 }
const value = Value.Upcast(T, { x: 1, y: 1, z: 1, w: 2 })
```
