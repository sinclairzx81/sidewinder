
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { TSchema, Type } from '@sidewinder/contract'
import { Form, Default } from '@sidewinder/react'

export interface AppProperties<T extends TSchema = TSchema> {
    schema: T
    value?: T['$static']
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

const C = Type.Contract({
    format: 'json',
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number())
    }
})

const F = Type.Function([Type.String(), Type.Number()], Type.String())
// const F = Type.String()
const Schema = C

ReactDOM.render(<App schema={Schema} />, document.getElementById('react'))


