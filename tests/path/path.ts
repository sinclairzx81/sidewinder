import { Path } from '@sidewinder/path'
import { Assert } from '../assert/index'
import * as path from 'path'

describe('path/Path', () => {
  const source = '/dir1/dir2/file.dat'

  it('should return equatable dirname', () => {
    const result0 = Path.dirname(source)
    const result1 = path.dirname(source)
    Assert.equal(result0, result1)
  })

  it('should return equatable basename', () => {
    const result0 = Path.basename(source)
    const result1 = path.basename(source)
    Assert.equal(result0, result1)
  })

  it('should return equatable extname', () => {
    const result0 = Path.extname(source)
    const result1 = path.extname(source)
    Assert.equal(result0, result1)
  })

  it('should return equatable join', () => {
    const result0 = Path.join('dir', '..', 'file.txt')
    const result1 = path.join('dir', '..', 'file.txt')
    Assert.equal(result0, result1)
  })

  it('should return equatable relative', () => {
    const result0 = Path.relative('dir', 'dir/file/file.txt')
    const result1 = path.relative('dir', 'dir/file/file.txt')
    Assert.equal(result0, result1.replace(/\\/g, '/'))
  })

  it('should return equatable normalize', () => {
    const result0 = Path.normalize('/../../dir/file.txt')
    const result1 = path.normalize('/../../dir/file.txt')
    Assert.equal(result0, result1.replace(/\\/g, '/'))
  })
})
