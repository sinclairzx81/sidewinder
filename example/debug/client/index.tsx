import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { TSchema, Type } from '@sidewinder/contract'
import { Form, Default } from '@sidewinder/react'


export interface AppProperties<T extends TSchema = TSchema> {
    schema: T
    value: T['$static']
}

export function App(props: AppProperties) {
    const [value, setValue] = React.useState(props.value)
    function onChange(value: any) {
        setValue(value)
    }
    return <div className="app">
        <div className='left'>
            <Form
                schema={props.schema}
                value={value as any}
                onChange={onChange}
            />
        </div>
        <div className="right">
            <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
    </div>
}

const Position = Type.Tuple([
    Type.Number(),
    Type.Number(),
    Type.Number(),
])

const User = Type.Object({
    email:     Type.String(),
    firstName: Type.String(),
    lastName:  Type.String(),
    mode: Type.Union([
        Type.Literal('enabled'),
        Type.Literal('disabled')
    ]),
    position:  Position,

    orders:    Type.Array( Position, { minItems: 3, controls: true }),
})

const Schema = JSON.parse(JSON.stringify(User))

const Value = Default.Create(Schema)
Value.mode = 'disabled'
Value.position = [3, 3, 3]
Value.orders.unshift([1, 2, 3])

ReactDOM.render(<App schema={Schema} value={Value} />, document.getElementById('react'))


