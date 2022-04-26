import { Compiler } from '@sidewinder/validator'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('validator/Compiler', () => {
  it('should compile a schema', () => {
    const T = Type.Object({ a: Type.Number() })
    const context = new Compiler(T)
    Assert.equal(context.validate({ a: 1 }), true)
  })

  it('should compile a referenced schema', () => {
    const T = Type.Object({ a: Type.Number() }, { $id: Assert.randomUUID() })
    const R = Type.Ref(T)
    const compiler = new Compiler(T, [R])
    Assert.equal(compiler.validate({ a: 1 }), true)
  })

  it('should throw if duplicate schema identifer', () => {
    Assert.throws(() => {
      const $id = Assert.randomUUID()
      const A = Type.Object({ a: Type.Number() }, { $id })
      const B = Type.Object({ a: Type.Number() }, { $id })
      new Compiler(A, [B])
    })
  })
})
