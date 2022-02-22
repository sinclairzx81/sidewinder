import { Compiler } from '@sidewinder/validator'
import { Type } from '@sidewinder/type'
import { Assert } from '../assert/index'

describe('validator/Compiler', () => {
  it('should compile a schema', () => {
    const T = Type.Object({ a: Type.Number() })
    const F = Compiler.compile(T)
    Assert.equal(F({ a: 1 }), true)
  })
  it('should compile a referenced schema', () => {
    const T = Type.Object({ a: Type.Number() }, { $id: Assert.randomUUID() })
    Compiler.addSchema([T])
    const R = Type.Ref(T)
    const F = Compiler.compile(R)
    Assert.equal(F({ a: 1 }), true)
  })

  it('should throw if duplicate schema identifer', () => {
    Assert.throws(() => {
      const $id = Assert.randomUUID()
      const A = Type.Object({ a: Type.Number() }, { $id })
      const B = Type.Object({ a: Type.Number() }, { $id })
      Compiler.addSchema([A])
      Compiler.addSchema([B])
    })
  })
})
