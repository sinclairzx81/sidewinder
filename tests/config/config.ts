import { Type, Configuration } from '@sidewinder/config'
import { Assert } from '../assert/index'

// prettier-ignore
describe('config/Configuration', () => {
  // ----------------------------------------------------------------
  // Convert
  // ----------------------------------------------------------------
  it('Should convert 1', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number(),
      Y: Type.Number()
    }))
    const resolved = configuration.parse({ X: 1, Y: 2 })
    Assert.deepEqual(resolved, { X: 1, Y: 2 })
  })
  it('Should convert 2', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number(),
      Y: Type.Number()
    }))
    const resolved = configuration.parse({ X: '1', Y: '2' })
    Assert.deepEqual(resolved, { X: 1, Y: 2 })
  })
  it('Should convert 3', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Boolean(),
      Y: Type.Boolean()
    }))
    const resolved = configuration.parse({ X: true, Y: false })
    Assert.deepEqual(resolved, { X: true, Y: false })
  })
  it('Should convert 4', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Boolean(),
      Y: Type.Boolean()
    }))
    const resolved = configuration.parse({ X: 'true', Y: 'false' })
    Assert.deepEqual(resolved, { X: true, Y: false })
  })
  it('Should convert 5', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Boolean(),
      Y: Type.Boolean()
    }))
    const resolved = configuration.parse({ X: 'TRUE', Y: 'faLse' })
    Assert.deepEqual(resolved, { X: true, Y: false })
  })
  it('Should convert 6', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Boolean(),
      Y: Type.Boolean()
    }))
    const resolved = configuration.parse({ X: '1', Y: '0' })
    Assert.deepEqual(resolved, { X: true, Y: false })
  })
  it('Should convert 7', () => {
    const configuration = Configuration(Type.Object({
      X: Type.String(),
      Y: Type.String()
    }))
    const resolved = configuration.parse({ X: '1', Y: '0' })
    Assert.deepEqual(resolved, { X: '1', Y: '0' })
  })
  it('Should convert 8', () => {
    const configuration = Configuration(Type.Object({
      X: Type.String(),
      Y: Type.String()
    }))
    const resolved = configuration.parse({ X: 1, Y: 0 })
    Assert.deepEqual(resolved, { X: '1', Y: '0' })
  })
  it('Should convert 9', () => {
    const configuration = Configuration(Type.Object({
      X: Type.String(),
      Y: Type.String()
    }))
    const resolved = configuration.parse({ X: true, Y: false })
    Assert.deepEqual(resolved, { X: 'true', Y: 'false' })
  })
  // ----------------------------------------------------------------
  // Default
  // ----------------------------------------------------------------
  it('Should default 1', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number({ default: 1 }),
      Y: Type.Number({ default: 2 })
    }))
    const resolved = configuration.parse({})
    Assert.deepEqual(resolved, { X: 1, Y: 2 })
  })
  it('Should default 2', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number({ default: '1' }),
      Y: Type.Number({ default: '2' })
    }))
    const resolved = configuration.parse({})
    Assert.deepEqual(resolved, { X: 1, Y: 2 })
  })
  it('Should default 3 (override)', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number({ default: '1' }),
      Y: Type.Number({ default: '2' })
    }))
    const resolved = configuration.parse({ X: 3 })
    Assert.deepEqual(resolved, { X: 3, Y: 2 })
  })
  it('Should default 4 (override)', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number({ default: '1' }),
      Y: Type.Number({ default: '2' })
    }))
    const resolved = configuration.parse({ X: '3' })
    Assert.deepEqual(resolved, { X: 3, Y: 2 })
  })
  // ----------------------------------------------------------------
  // Clean
  // ----------------------------------------------------------------
  it('Should clean 1', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number(),
      Y: Type.Number()
    }))
    const resolved = configuration.parse({ X: 1, Y: 2, Z: 3 })
    Assert.deepEqual(resolved, { X: 1, Y: 2 })
  })
  it('Should clean 2', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number({ default: 1 }),
      Y: Type.Number({ default: 2 })
    }))
    const resolved = configuration.parse({ Z: 3 })
    Assert.deepEqual(resolved, { X: 1, Y: 2 })
  })
  // ----------------------------------------------------------------
  // Throw
  // ----------------------------------------------------------------
  it('Should throw 1', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Number(),
      Y: Type.Number()
    }))
    Assert.throws(() => configuration.parse({ X: 1 }))
  })
  // ----------------------------------------------------------------
  // Structured
  // ----------------------------------------------------------------
  it('Should parse structured 1', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Object({
        Y: Type.Number()
      })
    }))
    const resolved = configuration.parse({ X: { Y: 1 } })
    Assert.deepEqual(resolved, { X: { Y: 1 } })
  })
  it('Should parse structured 2 (convert)', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Object({
        Y: Type.Number()
      })
    }))
    const resolved = configuration.parse({ X: { Y: '1' } })
    Assert.deepEqual(resolved, { X: { Y: 1 } })
  })
  it('Should parse structured 3 (override)', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Object({
        Y: Type.Number({ default: 1 })
      })
    }))
    const resolved = configuration.parse({ X: { Y: 2 } })
    Assert.deepEqual(resolved, { X: { Y: 2 } })
  })
  it('Should parse structured 4 (override)', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Object({
        Y: Type.Number({ default: 1 })
      })
    }))
    const resolved = configuration.parse({ X: { Y: '2' } })
    Assert.deepEqual(resolved, { X: { Y: 2 } })
  })
  it('Should parse structured 5 (default)', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Object({
        Y: Type.Number({ default: 1 })
      }, {
        default: {     // this is unusual. it is technically possible to instance
          Y: undefined // the interior property if the interior value is an object.
        }
      })
    }))
    const resolved = configuration.parse({ X: {} })
    Assert.deepEqual(resolved, { X: { Y: 1 } })
  })
  it('Should parse structured 6 (clean)', () => {
    const configuration = Configuration(Type.Object({
      X: Type.Object({
        Y: Type.Number({ default: 1 }),
      })
    }))
    const resolved = configuration.parse({ X: { Y: 2, Z: 3 } })
    Assert.deepEqual(resolved, { X: { Y: 2 } })
  })
})
