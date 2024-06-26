/*--------------------------------------------------------------------------

@sidewinder/hash

The MIT License (MIT)

Copyright (c) 2022-2024 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import bcrypt from 'bcryptjs'

/** Hashing utility specific to passwords Uses bcrypt as the hashing algorithm. */
export namespace PasswordHash {
  /** Compares the password against the given hash. Returns true if match. */
  export async function compare(password: string, hash: string) {
    return await bcrypt.compare(password, hash)
  }

  /** Hashes the given password with the given number salt of iterations. */
  export async function hash(password: string, rounds: number = 8) {
    const salt = await bcrypt.genSalt(rounds)
    return await bcrypt.hash(password, salt)
  }
}
