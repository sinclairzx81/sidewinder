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

The TokenEncoder is responsible for encoding a claims object intended to be sent to a remote system over the network. The TokenEncoder accepts the type of the claims as it's first constructor argument, followed by a valid RSA private key kept secret to the encoding process. The TokenEncoder will throw an error if the data being encoded is not of the correct type.

```typescript
import { TokenEncoder } from '@sidewinder/token'
import { Type }         from '@sidewinder/type'

const privateKey = '....'              // Note: Private Keys are of type string.

const encoder = new TokenEncoder(Type.Object({
    username: Type.String(),
    roles:    Type.Array(Type.String())
}), privateKey)

const encoded = encoder.encode({       // Note: Data must conform to the structure
    username: 'dave',                  //       given on the encoders constructor
    roles: ['admin', 'moderator']      //       or an error is thrown.
})

// send 'encoded' to remote process
```

## TokenDecoder

The TokenEncoder is responsible for decoding a claims object received from a remote system over the network. The TokenEncoder accepts the type of the claims as it's first constructor argument, followed by a valid RSA `publicKey` given to the decoding process via some user defined mechanism. The TokenEncoder will throw an error if the data being decoded is not of the correct type.

```typescript
import { TokenDecoder } from '@sidewinder/token'
import { Type }         from '@sidewinder/type'


const token     = '...'                // Note: Token is received via some network mechanism

const publicKey = '...'                // Note: Public Keys are of type string.

const decoder = new TokenDecoder(Type.Object({
    username: Type.String(),
    roles:    Type.Array(Type.String())
}), publicKey)

const token = decoder.decode(encoded)  // Note: The decode() function will throw
                                       //       if the given encoded data cannot
                                       //       be verified with the configured
                                       //       publicKey, or if the type of the
                                       //       claims data does not match that
                                       //       of the configured schema.
``` 

## Generate