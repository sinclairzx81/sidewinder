import { Buffer } from '@sidewinder/buffer'
import { Assert } from '../assert/index'

describe('buffer/Buffer', () => {
  it('Should alloc a new zero buffer', () => {
    const buffer = Buffer.alloc(128)
    Assert.equal(buffer.length, 128)
    for (let i = 0; i < buffer.length; i++) {
      Assert.equal(buffer[i], 0)
    }
  })

  it('Should alloc random buffer', () => {
    const buffer = Buffer.random(128)
    Assert.equal(buffer.length, 128)
  })

  it('Should encode and decode a string', () => {
    const source = 'hello world'
    const buffer = Buffer.encode(source)
    const target = Buffer.decode(buffer)
    Assert.equal(source, target)
  })

  it('Should compare buffers with equals', () => {
    const A = new Uint8Array([0, 1, 2, 3])
    const B = new Uint8Array([0, 1, 2, 3])
    const C = new Uint8Array([0, 1, 2, 4])
    const D = new Uint8Array([0, 1, 2])
    Assert.equal(Buffer.equals(A, B), true)
    Assert.equal(Buffer.equals(A, C), false)
    Assert.equal(Buffer.equals(A, D), false)
  })

  it('Should concat buffers', () => {
    const A = new Uint8Array([0, 1, 2, 3])
    const B = new Uint8Array([4, 5, 6, 7])
    const C = new Uint8Array([8, 9, 10, 11])
    const D = new Uint8Array([12, 13, 14])
    const E = Buffer.concat([A, B, C, D])
    Assert.deepEqual(E, new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]))
  })

  it('Should iterate buffers (1)', () => {
    const buffer: any[] = []
    for (const [subarray, final] of Buffer.iter(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]), 4)) {
      buffer.push([[...subarray], final])
    }
    Assert.deepEqual(buffer[0], [[0, 1, 2, 3], false])
    Assert.deepEqual(buffer[1], [[4, 5, 6, 7], false])
    Assert.deepEqual(buffer[2], [[8, 9, 10, 11], false])
    Assert.deepEqual(buffer[3], [[12, 13, 14], true])
  })
  it('Should iterate buffers (2)', () => {
    const buffer: any[] = []
    for (const [subarray, final] of Buffer.iter(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]), 4)) {
      buffer.push([[...subarray], final])
    }
    Assert.deepEqual(buffer[0], [[0, 1, 2, 3], false])
    Assert.deepEqual(buffer[1], [[4, 5, 6, 7], false])
    Assert.deepEqual(buffer[2], [[8, 9, 10, 11], false])
    Assert.deepEqual(buffer[3], [[12, 13, 14, 15], true])
  })
})
