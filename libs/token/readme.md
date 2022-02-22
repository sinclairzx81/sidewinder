<div align='center'>

<h1>Sidewinder Token</h1>

<p>Type Safe Json Web Token</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/token?label=%40sidewinder%2Ftoken">](https://www.npmjs.com/package/@sidewinder/token)

</div>

## Overview

Sidewinder Token is a type safe Json Web Token library used to sign and verify claims exchanged between services over a network. This library is built upon the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) package but provides additional type checking for claims data for both signer and verifier. This package supports asymmetric signing only.

Licence MIT

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [TokenEncoder](#TokenEncoder)
- [TokenDecoder](#TokenDecoder)
- [Generate Keys](#Generate-Keys)

## Example

The following shows general usage

```typescript
import { Generate, TokenEncoder, TokenDecoder } from '@sidewinder/token'
import { Type } from '@sidewinder/type'

// ----------------------------------------------------------------------
// Generate private and public key pair
// ----------------------------------------------------------------------

const [privateKey, publicKey] = Generate.KeyPair()

// ----------------------------------------------------------------------
// Create create a token type schematic
// ----------------------------------------------------------------------

const Token = Type.Object({
  username: Type.String(),
  roles: Type.Array(Type.String()),
})

// ----------------------------------------------------------------------
// Create a TokenEncoder and encode token
// ----------------------------------------------------------------------

const encoder = new TokenEncoder(Token, privateKey)

const token = encoder.encode({ username: 'dave', roles: ['admin', 'moderator'] })

// ----------------------------------------------------------------------
// Create a TokenDecoder and decode token
// ----------------------------------------------------------------------

const decoder = new TokenDecoder(Token, public)

const claims = decoder.decode(token)
```

## TokenEncoder

The TokenEncoder is responsible for encoding a claims object intended to be sent to a remote system over the network. The TokenEncoder accepts the type of the claims as it's first constructor argument, followed by a valid RSA private key kept secret to the encoding process. The TokenEncoder will throw an error if the data being encoded is not of the correct type.

```typescript
import { TokenEncoder } from '@sidewinder/token'
import { Type } from '@sidewinder/type'

const privateKey = '....' // Note: Private Keys are of type string.

const encoder = new TokenEncoder(
  Type.Object({
    username: Type.String(),
    roles: Type.Array(Type.String()),
  }),
  privateKey,
)

const encoded = encoder.encode({
  // Note: Data must conform to the structure
  username: 'dave', //       given on the encoders constructor
  roles: ['admin', 'moderator'], //       or an error is thrown.
})

// send 'encoded' to remote process
```

## TokenDecoder

The TokenEncoder is responsible for decoding a claims object received from a remote system over the network. The TokenEncoder accepts the type of the claims as it's first constructor argument, followed by a valid RSA `publicKey` given to the decoding process via some user defined mechanism. The TokenEncoder will throw an error if the data being decoded is not of the correct type.

```typescript
import { TokenDecoder } from '@sidewinder/token'
import { Type } from '@sidewinder/type'

const token = '...' // Note: Token is received via some network mechanism

const publicKey = '...' // Note: Public Keys are of type string.

const decoder = new TokenDecoder(
  Type.Object({
    username: Type.String(),
    roles: Type.Array(Type.String()),
  }),
  publicKey,
)

const token = decoder.decode(encoded) // Note: The decode() function will throw
//       if the given encoded data cannot
//       be verified with the configured
//       publicKey, or if the type of the
//       claims data does not match that
//       of the configured schema.
```

<a name="Generate-Keys"></a>

## Generate Keys

The Sidewinder Token library uses asymmetric RS256 exclusively for token sign and verify. You can generate private and public keys either via command line or programmatically.

<details>
  <summary>Command Line</summary>

```bash
# Generate private and public keys
$ ssh-keygen -t rsa -b 4096 -m PEM -f private.key

# Convert public key to PEM format
$ openssl rsa -in private.key -pubout -outform PEM -out public.key
```

</details>

<details>
  <summary>Programmatically</summary>

```typescript
import { Generate } from '@sidewinder/token'

const [privateKey, publicKey] = Generate.KeyPair(4096)
```

</details>
