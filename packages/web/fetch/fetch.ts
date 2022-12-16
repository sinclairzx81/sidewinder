/*--------------------------------------------------------------------------

@sidewinder/web

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import type Fetch from 'node-fetch' // note: required for build dependency check
import { Platform } from '@sidewinder/platform'

/** Browser and Node compatible Fetch */
export async function fetch(input: RequestInfo, init?: RequestInit | undefined): Promise<Response> {
  if (Platform.platform() === 'browser') {
    return globalThis.fetch(input, init)
  } else {
    // ----------------------------------------------------------------------
    // Note: If we observe a problem here, it's likely due to issues with
    // using `import` over `require` in downstream bundlers. If problems
    // arise, consider downgrading node-fetch to version 2.0.
    // ----------------------------------------------------------------------
    const fetch = await Platform.dynamicImport('node-fetch')
    return fetch.default(input, init)
  }
}
