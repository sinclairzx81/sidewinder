<div align='center'>

<h1>Sidewinder Validation</h1>

<p>Validation of Sidewinder Types</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/validation?label=%40sidewinder%2Fvalidation">](https://www.npmjs.com/package/@sidewinder/validation)

</div>

## Overview

This package provides JSON schema validation for the `@sidewinder/type` package. It is built upon Ajv and provides additional validation support for `Uint8Array` as well as `void` used in Sidewinder Contracts.

License MIT

## Contents

- [Overview](#Overview)
- [Install](#Install)
- [Example](#Example)
- [Assert](#Assert)
- [Check](#Check)
- [Reference Types](#Reference-Types)

## Install

```bash
$ npm install @sidewinder/validation
```

## Example

The following shows general usual

```typescript
import { Validator } from '@sidewinder/validation'
import { Type }      from '@sidewinder/type'

const T = Type.Object({
    a: Type.String(),
    b: Type.Number(),
    c: Type.Boolean(),
    d: Type.Uint8Array(),
    e: Type.Void()
})

const validator = new Validator(T)

validator.assert({
    a: 'foo',
    b: 1,
    c: true,
    d: new Uint8Array(),
    e: null
})

```

## Assert

The assert function will check the given data and throws with a `ValidatorError` if the data fails to check.

```typescript
import { Validator, ValidatorError } from '@sidewinder/validation'

const validator = new Validator(T)

try {
    validator.assert({
        a: 'foo',
        b: 1,
        c: true,
        d: new Uint8Array(),
        e: null
    })
} catch (error) {
    if(error instanceof ValidatorError) {
        console.log(error.errors)
        console.log(error.message)
    } 
}

```

## Check

The check function will check the given data and return a `ValidatorResult` object containing the result of the validation. This can be used
to test the value without throwing.

```typescript

import { Validator, ValidatorResult } from '@sidewinder/validation'

const validator = new Validator(T)

const result: ValidationResult = validator.check({
    a: 'foo',
    b: 1,
    c: true,
    d: new Uint8Array(),
    e: null
})

if(!result.success) {
    console.log(result.errors)
    console.log(result.message)
}
```

<a name="Reference-Types"></a>

## Referenced Types

Sidewinder Validation supports schema referencing by appending the internal AJV schema compiler with additional schemas. Internally it maintains a singleton validation context that can be appended with additional schemas which allow the compiler to reference in downstream types. Because the compiler is singleton, each schema MUST have a unique `$id` across the entire application.

```typescript
import { Compiler, Validator } from '@sidewinder/validation'

// -------------------------------------------------------------------
// Referenceable Schema
// -------------------------------------------------------------------

const T = Type.Object({
    a: Type.String(),
    b: Type.Number(),
    c: Type.Boolean(),
    d: Type.Uint8Array(),
    e: Type.Void()
}, { $id: 'T' }) // must be unique

Compiler.addSchema(T)

// -------------------------------------------------------------------
// Referenced Type
// -------------------------------------------------------------------

const R = Type.Ref(T)

const validator = new Validator(R)

// -------------------------------------------------------------------
// Check
// -------------------------------------------------------------------

const result = validator.check({
    a: 'foo',
    b: 1,
    c: true,
    d: new Uint8Array(),
    e: null
})

```