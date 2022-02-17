import { Type }     from '@sidewinder/types'
import { ok, fail } from './validate'
import * as assert from '../../assert/index'

describe('types/Ref', () => {

    it('Should should validate when referencing a type', () => {
        const T = Type.Object({
            x: Type.Number(),
            y: Type.Number(),
            z: Type.Number()
        }, { $id: assert.randomUUID() })
        const R = Type.Ref(T)
        ok(R, { 
            x: 1, 
            y: 2, 
            z: 3 
        }, [T])
    })

    it('Should not validate when passing invalid data', () => {
        const T = Type.Object({
            x: Type.Number(),
            y: Type.Number(),
            z: Type.Number()
        }, { $id: assert.randomUUID() })
        const R = Type.Ref(T)
        fail(R, { 
            x: 1, 
            y: 2
        }, [T])
    })

    it('Should throw when not specifying an $id on target schema', () => {
        try {
            const T = Type.Object({
                x: Type.Number(),
                y: Type.Number(),
                z: Type.Number()
            }, { })
            const R = Type.Ref(T)
        } catch {
            return
        }
        throw Error('Expected throw')
    })
    
    it('Should validate as a Namespace, and as a Ref (R1)', () => {
        const Vertex = Type.Object({
            x: Type.Number(),
            y: Type.Number(),
            z: Type.Number()
        }, { $id: assert.randomUUID() })
        
        const Namespace = Type.Namespace({ 
            Vertex 
        }, { $id: assert.randomUUID() })
        
        const R1 = Type.Ref(Vertex)

        ok(R1, { 
            x: 1, 
            y: 2, 
            z: 3 
        }, [Namespace])
    })

    it('Should validate as a Namespace, and as a Ref (R2)', () => {
        const Vertex = Type.Object({
            x: Type.Number(),
            y: Type.Number(),
            z: Type.Number()
        }, { $id: assert.randomUUID() })
        
        const Namespace = Type.Namespace({ 
            Vertex 
        }, { $id: assert.randomUUID() })
        
        const R2 = Type.Ref(Namespace, 'Vertex')

        ok(R2, { 
            x: 1, 
            y: 2, 
            z: 3 
        }, [Namespace])
    })
})