import { TString, Type }   from '@sidewinder/contract'
import * as React          from 'react'
import * as ReactDOM       from 'react-dom'
import { SchemaComponent } from '@sidewinder/react'

const Vector = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number()
})

const T = Type.Object({
    'a': Type.Number(),
    'b': Type.String(),
    'c': Type.Boolean(),
    'array': Type.Array(Vector)
})

ReactDOM.render(<div><SchemaComponent property='' schema={T} value={{
    "a": 1,
    "b": 'hello',
    "c": true,
    array: [{x: 1, y: 1, z: 1 }]
}} /></div>, document.getElementById('container'))


