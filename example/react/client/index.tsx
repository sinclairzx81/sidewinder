import { TSchema, Type } from '@sidewinder/contract'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { SchemaComponent, Default } from '@sidewinder/react'

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
                property='new' 
                schema={props.schema} 
                value={value} 
                onChange={onChange} 
                />
        </div>
        <div className="right">
            <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
    </div>
}



const Vector = Type.Object({
    type: Type.Union([
        Type.Literal('A'),
        Type.Literal('B'),
        Type.Literal('C'),
    ]),
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number()
})

const Schema = Type.Array(Vector, { minItems: 2 })

const Value = Default.Create(Schema)

console.log(Value)

ReactDOM.render(<App schema={Schema} value={Value} />, document.getElementById('react'))


