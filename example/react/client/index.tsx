import { TString, Type }   from '@sidewinder/contract'
import * as React          from 'react'
import * as ReactDOM       from 'react-dom'
import { SchemaComponent } from '@sidewinder/react'

const T = Type.Object({
    'a': Type.String(),
    'b': Type.String(),
    'c': Type.String()
})

ReactDOM.render(<div><SchemaComponent property='' schema={T} value={{
    "a": 'valueA',
    "b": 'valueB',
    "c": 'valueC'
}} onChange={(property, value) => {
    console.log(property, value)
}} /></div>, document.getElementById('container'))


