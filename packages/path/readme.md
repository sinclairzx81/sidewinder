<div align='center'>

<h1>Sidewinder Path</h1>

<p>File System Path Utility for Node and the Browser</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/path?label=%40sidewinder%2Fpath">](https://www.npmjs.com/package/@sidewinder/path)

</div>

## Overview

This package provides NodeJS pathing utilities that work in Browser environments. It mirrors the NodeJS core `path` module.

```typescript
import { Path } from '@sidewinder/path'

const dirname = Path.dirname('/directory/file.txt') // '/directory'
const basename = Path.basename('/directory/file.txt') // 'file.ext'
const extname = Path.extname('/directory/file.txt') // '.txt'
const joined = Path.join(dirname, basename) // '/directory/file.txt'
```
