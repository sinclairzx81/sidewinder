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
- [Documentation](#Documentation)

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
Which will source the following Environment Variables.
```bash
ENABLED
MONGO_HOST
MONGO_PORT
REDIS_HOST
REDIS_PORT
```

## Command Line Arguments

Command line arguments are sourced from lowercase `--` prefixed property names with a dash `-` used to seperate object context. Only JavaScript string, number, boolean values can be sourced from Environment Variable. Consider the following.

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

Which will source the following command line arguments.

```bash
$ node index.js --port 5000 --redis-host localhost --redis-port 6379 
```