import { TSchema, Type } from '@sidewinder/contract'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { SchemaComponent } from '@sidewinder/react'

export interface AppProperties<T extends TSchema = TSchema> {
    schema: T
    value:  T['$static']
}

export function App(props: AppProperties) {
    const [value, setValue] = React.useState(props.value)
    function onChange(_: string, value: any) {
        setValue(value)
    }
    return <div className="app">
        <div className='left'>
            <SchemaComponent 
                property='' 
                schema={Schema} 
                value={value} 
                onChange={onChange} 
                />
        </div>
        <div className="right">
            <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
    </div>
}


const T = Type.Object({
    'a': Type.String(),
    'b': Type.String(),
    'c': Type.String()
})

const Schema = Type.Array(T)

const Value = [
    {
        "a": 'valueA',
        "b": 'valueB',
        "c": 'valueC'
    },
    {
        "a": 'valueA',
        "b": 'valueB',
        "c": 'valueC'
    },
    {
        "a": 'valueA',
        "b": 'valueB',
        "c": 'valueC'
    },
] as const

ReactDOM.render(<App schema={Schema} value={Value} />, document.getElementById('react'))


