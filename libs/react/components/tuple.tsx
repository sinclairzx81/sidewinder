import * as React from 'react'
import { TTuple } from '@sidewinder/contract'
import { SchemaComponentProperties } from './schema'
import { Default } from './default'
import { SchemaComponent } from '.'


export interface TupleComponentProperties<T extends TTuple<any[]>> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function TupleComponent<T extends TTuple<any[]>>(props: TupleComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    
    async function onChange(property: string, value: unknown) {
        const index = parseInt(property)
        const next = [...state]
        next[index] = value
        props.onChange(props.property, next)
        setState(next) 
    }

    return <div className='type-tuple'>
        <div className='elements'>
            {props.schema.items!.map((schema, index) => {
                return <div key={index} className='element'>
                    <SchemaComponent
                        property={index.toString()}
                        schema={schema}
                        value={state[index]}
                        onChange={onChange}
                    />
                </div>
            })}
        </div>
    </div>
}

