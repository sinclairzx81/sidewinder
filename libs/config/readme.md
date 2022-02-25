<div align='center'>

<h1>Sidewinder Config</h1>

<p>Type Safe Configurations with Sidewinder Types</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/config?label=%40sidewinder%2Fconfig">](https://www.npmjs.com/package/@sidewinder/config)

</div>

## Overview

This package enables type safe configuation resolution using Sidewinder Types. It is able to resolve configuration settings from environment variables, command line arguments or json configuration files.

## Contents

- [Overview](#Overview)
- [Example](#Example)
- [Environment Variables](#EnvironmentVariables)
- [Commmand Line Arguments](#CommandLineArguments)
- [Documentation and Help](#Documentation)

## Example

The following shows general usage. The configuration `resolve()` function will attempt to resolve configurations from series of resolution passes. The first resolution pass will attempt to resolve from an optional `config.json` file, the second pass attempts to resolve from environment variables and the final resolution pass attempts to resolve from from command line arguments. Each resolution pass will override the previous values resolved from the last allowing configurations to be partially constructed from a number of sources. If the resulting object fails to match the schematics of the type provided, the process will automatically exit with a non-zero exit code and display help information to the terminal.

```typescript
import { Type, Configuration } from '@sidewinder/configuration'

// Specify the structure of the configuration expected by the application.
// Types can be optional, or with default values. This type is used to
// source configurations from the environment or command line arguments.
const configuration = Configuration(Type.Object({
    port: Type.Integer({ default: 5000 }),
    mongo: Type.Object({
        host: Type.String()
        port: Type.Integer()
    }),
    redis: Type.Object({
        host: Type.String()
        port: Type.Integer()
    })
}))

// Resolves configurations from command line arguments and environment
// variable or process.exit(1) with error message. If this function
// succeeds then the application can trust the config object is of
// the expected type.
const config = configuration.resolve('config.json')

// const config = {
//    port: 5000
//    mongo: {
//        host: '...',
//        port: 6379
//    },
//    redis: {
//        host: '...',
//        port: 6379
//    }
// }
```

## Environment Variables

Environment Variables are sourced from capitalized property names with an underscore `_` used to seperate object context. Only JavaScript string, number, boolean values can be sourced from Environment Variable. Consider the following.

```typescript

// Configurations will be resolved from the process.env object. If using
// libraries such as dotenv to source development, staging and production
// environments, ensure you assign these environment variables prior to
// calling Configuration(...).

process.env.MONGO_HOST = 'localhost'
process.env.MONGO_PORT = '6379'
process.env.PORT       = '5000'

const configuration = Configuration(Type.Object({
    port: Type.Integer({ default: 5000 }),
    mongo: Type.Object({
        host: Type.String()
        port: Type.Integer()
    }),
    redis: Type.Object({
        host: Type.String()
        port: Type.Integer()
    })
}))

```

Which will source for the following environment variables.

```bash
ENABLED
MONGO_HOST
MONGO_PORT
REDIS_HOST
REDIS_PORT
```

## Command Line Arguments

Command line arguments are sourced from `process.argv' using lowercase `--`prefixed property names with a dash`-` used to seperate object context. Only JavaScript string, number, boolean values can be sourced from Environment Variable. Consider the following.

```typescript
const configuration = Configuration(Type.Object({
    port: Type.Integer({ default: 5000 }),
    mongo: Type.Object({
        host: Type.String()
        port: Type.Integer()
    }),
    redis: Type.Object({
        host: Type.String()
        port: Type.Integer()
    })
}))

```

Which will source from the following environment variables.

```bash
$ node index.js --port 5000 --redis-host localhost --redis-port 6379
```

## Documentation and Help

In the instance the `.resolve()` function cannot resolve an object matching the given configuration type, the process will immediately exit with an non-zero exit code and display help documentation giving hints as to what went wrong. Additionally, help information can be displayed by specifying a `--help` option as a command line argument to the process.

You can specify optional `description` and `default` properties for each expected value.

```typescript
const configuration = Configuration(
  Type.Object({
    port: Type.Integer({ default: 5000, description: 'Server port' }),
    mongo: Type.Object({
      host: Type.String({ description: 'Mongo host' }),
      port: Type.Integer({ description: 'Mongo port' }),
    }),
    redis: Type.Object({
      host: Type.String({ default: 'localhost', description: 'Redis host' }),
      port: Type.Integer({ default: '6379', description: 'Redis port' }),
    }),
  }),
)
```

Which produces the following help documentation

```bash
Options:

  --port         PORT         integer?  Server port
  --mongo-host   MONGO_HOST   string    Mongo host
  --mongo-port   MONGO_PORT   integer   Mongo port
  --redis-host   REDIS_HOST   string?   Redis host
  --redis-port   REDIS_PORT   integer?  Redis port
```
