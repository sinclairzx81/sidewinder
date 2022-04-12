import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/patch/Tuple', () => {
  const T = Type.Tuple([Type.Number(), Type.String()])
  const E = [0, '']

  it('Should patch from string', () => {
    const value = 'hello'
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should patch from number', () => {
    const value = 1
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should patch from boolean', () => {
    const value = true
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should patch from object', () => {
    const value = {}
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should patch from array', () => {
    const value = [1]
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, [1, ''])
  })

  it('Should patch from undefined', () => {
    const value = undefined
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should patch from null', () => {
    const value = null
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should preserve', () => {
    const value = [42, 'world']
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should patch with empty', () => {
    const value = [] as any[]
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should append with less than tuple length', () => {
    const value = [42]
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, [42, ''])
  })

  it('Should truncate with greater than tuple length', () => {
    const value = [42, '', true]
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, [42, ''])
  })

  it('Should preserve and patch invalid element', () => {
    const value = [true, 'hello']
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, [0, 'hello'])
  })
})
