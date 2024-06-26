/*--------------------------------------------------------------------------

@sidewinder/buffer

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

/** Functions for performing operations on type Uint8Array */
export namespace Buffer {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  /** Allocates a new Uint8Array of the given length */
  export function alloc(length: number): Uint8Array {
    return new Uint8Array(length)
  }

  /** Generates a random buffer of the given length */
  export function random(length: number): Uint8Array {
    const buffer = new Uint8Array(length)
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256)
    }
    return buffer
  }

  /** Returns true if the given buffers are the same */
  export function equals(bufferA: Uint8Array, bufferB: Uint8Array): boolean {
    if (bufferA.length !== bufferB.length) return false
    for (let i = 0; i < bufferA.length; i++) {
      if (bufferA[i] !== bufferB[i]) return false
    }
    return true
  }

  /** Encodes the given  string to Uint8Array */
  export function encode(input: string): Uint8Array {
    return encoder.encode(input)
  }

  /** Decodes the given Uint8Array buffer to string */
  export function decode(input?: BufferSource | undefined, options?: TextDecodeOptions | undefined): string {
    return decoder.decode(input, options)
  }

  /** Concatinates the given buffers */
  export function concat(buffers: Uint8Array[]): Uint8Array {
    const length = buffers.reduce((acc, c) => acc + c.length, 0)
    const output = new Uint8Array(length)
    let offset = 0
    for (const buffer of buffers) {
      output.set(buffer, offset)
      offset += buffer.length
    }
    return output
  }

  /**
   * Creates an iterator for the given buffer which is chunked up to the
   * given size. Items are yielded as [subarray, final] with final indicating
   * the last chunk in the iterator.
   */
  export function* iter(buffer: Uint8Array, size: number): Generator<[subarray: Uint8Array, final: boolean]> {
    if (size <= 0) {
      yield [buffer, true]
      return
    }
    const partials = Math.floor(buffer.length / size)
    const remaining = buffer.length - partials * size
    let offset = 0
    for (let i = 0; i < partials; i++, offset += size) {
      const subarray = buffer.subarray(offset, offset + size)
      if (i === partials - 1 && remaining === 0) {
        yield [subarray, true]
        return
      }
      yield [subarray, false]
    }
    const subarray = buffer.subarray(offset, offset + remaining)
    yield [subarray, true]
  }
}
