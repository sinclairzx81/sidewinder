
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { TContract, TSchema, Type } from '@sidewinder/contract'
import { SchemaComponent, ContractComponent, Default } from '@sidewinder/react'

export interface AppProperties<T extends TSchema = TSchema> {
    schema: T
    value?: T['$static']
}

export function App(props: AppProperties) {
    const [value, setValue] = React.useState(props.value)
    function onCall(method: string, params: unknown[]) {
        console.log(method, params)
    }
    return <div className="app">
        <div className='left'>
            <ContractComponent schema={props.schema as TContract} onCall={onCall} />
        </div>
        <div className="right">
            <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
    </div>
}

const Vector = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number()
})
const C = Type.Contract({
    format: 'json',
    server: {
        sub: Type.Function([Type.Array(Vector, { controls: true }), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number())
    }
})

const F = Type.Function([Vector, Type.Number()], Type.Number())
const S = Type.String()
const V = Vector
const Schema = C

ReactDOM.render(<App schema={Schema} />, document.getElementById('react'))


