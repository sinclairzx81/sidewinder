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


const DerivedClass = Type.Object({
    e: Type.String(),
    f: Type.String(),
    g: Type.String(),
    option: Type.Union([
        Type.Literal(1),
        Type.Literal(2),
    ], { default: 2 })
})

const Position = Type.Tuple([
    Type.Number(),
    Type.Number(),
    Type.Number(),
])

const User = Type.Object({
    email:     Type.String({}),
    firstName: Type.String({ label: 'first' }),
    lastName:  Type.String(),
    position:  Position,
    orders:    Type.Array( Type.String(), { minItems: 3 }),
})

const Schema = User

const Value = Default.Create(Schema)

console.log(Value)

ReactDOM.render(<App schema={Schema}  />, document.getElementById('react'))


