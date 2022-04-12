<div align='center'>

<h1>Sidewinder Value</h1>

<p>Constructs Values from Sidewinder Types</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/value?label=%40sidewinder%2Fvalue">](https://www.npmjs.com/package/@sidewinder/value)

</div>

<a name="Overview"></a>

## Overview

Sidewinder Value is a library that constructs values from Sidewinder Types. It can build new values from scratch using an existing Sidewinder Type or patch an existing value to match type while preserving values. It offers lightweight runtime type checking.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Usage](#Usage)
- [Create](#Create)
- [Check](#Check)
- [Patch](#Patch)

## Install

```bash
$ npm install @sidewinder/value
```

## Usage

The following shows general usage

```typescript
import { Type, Value } from '@sidewinder/value'

// ------------------------------------------------------
// Create
// ------------------------------------------------------

const A = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
})

// const vector2 = { x: 0, y: 0 }
const a = Value.Create(A)
a.x = 1
a.y = 2

// ------------------------------------------------------
// Check
// ------------------------------------------------------

Value.Check(A, a) // true

// ------------------------------------------------------
// Patch
// ------------------------------------------------------

const B = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  z: Type.Number(),
})

// const b = { x: 1, y: 2, z: 0 }
const b = Value.Patch(B, a)
```

## Create

Sidewinder Value can construct JavaScript values for any given Sidewinder Type. You can use the `default` option to override the value.

```typescript
import { Value, Type } from '@sidewinder/type'

const T = Type.Object({
  x: Type.Number({ default: 0 }),
  y: Type.Number({ default: 0 }),
  z: Type.Number({ default: 0 }),
  w: Type.Number({ default: 1 })
})

// const value = { x: 0, y: 0, z: 0, w: 1 }
const value = Value.Create(T)
```

## Check

You can check a value matches a given type using the `Value.Check(...)` function.

```typescript
import { Value, Type } from '@sidewinder/type'

const T = Type.Object({
  x: Type.Number({ default: 0 }),
  y: Type.Number({ default: 0 }),
  z: Type.Number({ default: 0 }),
  w: Type.Number({ default: 1 })
})

// const check = true
const check = Value.Check({ x: 1, y: 1, z: 1, w: 2 })
```

## Patch

It can be helpful to patch values that only partially matche a target type. The `Value.Patch(...)` function will accept both a type and value, and attempt to patch the value to conform to the target schema while preserving as much information as possible in the original value. The following updates the type to include an `id` property and removes the `w` property. The `Value.Patch(...)` function will add a default `id` and omit the `w` property in the resulting value.

```typescript
import { Value, Type } from '@sidewinder/type'

const T = Type.Object({
  id: Type.String()
  x: Type.Number({ default: 0 }),
  y: Type.Number({ default: 0 }),
  z: Type.Number({ default: 0 }),
})

// const value = { id: '', x: 1, y: 1, z: 1 }
const value = Value.Patch(T, { x: 1, y: 1, z: 1, w: 2 })
```