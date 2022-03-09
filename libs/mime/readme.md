<div align='center'>

<h1>Sidewinder Mime</h1>

<p>Sidewinder Mime Types</p>

[<img src="https://img.shields.io/npm/v/@sidewinder/mime?label=%40sidewinder%2Fmime">](https://www.npmjs.com/package/@sidewinder/mime)

</div>

## Overview

This package contains a mime type lookup utility.

License MIT

## Example

The Mime utility provides a single lookup function that accepts a path or filename and returns an default mime type. If the lookup function cannot resolve the mime type, it will return a default of `application/octet-stream`.

```typescript
import { Mime } from '@sidewinder/mime'

const mime0 = Mime.lookup('directory/file.txt') // 'text/plain'
const mime1 = Mime.lookup('directory/file.xml') // 'application/xml'
const mime2 = Mime.lookup('directory/file.json') // 'application/json'
const mime3 = Mime.lookup('directory/file.png') // 'image/png'
const mime3 = Mime.lookup('directory/file.mp4') // 'video/mp4'
```
