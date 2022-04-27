import { Type, Static, TObject, TKeyOf, ObjectPropertyKeys, TUnion, TLiteral, TString } from '@sidewinder/type'


const T = Type.Object({
    a: Type.String(),
    b: Type.String(),
    c: Type.String()
})

const K = Type.KeyOf(T)

const R = Type.Record(K, Type.String())

type R = Static<typeof R>

