<div align='center'>

<h1>Sidewinder Token</h1>

<p>Type Safe Json Web Token</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/token?label=%40sidewinder%2Ftoken">](https://www.npmjs.com/package/@sidewinder/token)

</div>


## Overview

Sidewinder Token is a Type Safe Json Web Token library used to sign and verify claims exchanged between services over a network. This library is built upon the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) package and provides additional type checking for claims data for both signer and verifier. This package uses asymmetric (RS256) signing only. This library provides utility RSA 2048 key pair generation for dynamically creating new keys at runtime.

Licence MIT

## Example

The following shows general usage

```typescript
import { Generate, TokenEncoder, TokenDecoder } from '@sidewinder/token'
import { Type }                                 from '@sidewinder/type'

// ----------------------------------------------------------------------
// Generate Private and Public Key Pair
// ----------------------------------------------------------------------

const [privateKey, publicKey] = Generate.KeyPair()

// ----------------------------------------------------------------------
// Create a Token Type
// ----------------------------------------------------------------------
const Token = Type.Object({
    username: Type.String(),
    roles:    Type.Array(Type.String())
})

// ----------------------------------------------------------------------
// Create a TokenEncoder and Encode Claims
// ----------------------------------------------------------------------

const encoder = new TokenEncoder(Token, privateKey)

const token = encoder.encode({ username: 'dave', roles: ['admin', 'moderator'] })

// ----------------------------------------------------------------------
// Create a TokenDecoder and Decode Claims
// ----------------------------------------------------------------------

const decoder = new TokenDecoder(Token, public)

const claims = decoder.decode(token) 
```

## TokenEncoder

## TokenDecoder

## Generate