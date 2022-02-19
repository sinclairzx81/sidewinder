/*--------------------------------------------------------------------------

@sidewinder/platform

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


/** Resolves the platform the current code is executing on */
export namespace Platform {
    export interface Version {
        major: number,
        minor: number,
        revision: string
    }

    /** Resolves the JavaScript environment */
    export function platform(): 'node' | 'browser' {
        return typeof window === 'undefined' ? 'node' : 'browser'
    }

    let _version: Version | undefined

    /** Resolves the node version */
    export function version(): Version {
        if(_version) return _version
        if(platform() === 'node') {
            const [_major, _minor, revision] = process.version.split('.')
            const major = parseInt(_major.replace('v', ''))
            const minor = parseInt(_minor.replace('v', ''))
            _version = {  major, minor, revision }
            return _version
        } else {
            _version = { major: 0, minor: 0, revision: '' }
            return _version
        }
    }
}