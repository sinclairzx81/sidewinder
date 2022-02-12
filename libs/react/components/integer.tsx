import * as React from 'react'
import { TInteger } from '@sidewinder/contract'
import { SchemaComponentProperties } from './schema'


export interface IntegerComponentProperties<T extends TInteger> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function IntegerComponent<T extends TInteger>(props: IntegerComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const next = parseInt(e.target.value)
        props.onChange(props.property, next)
        setState(next)
    }
    return <div className='type-integer'>
        <input type='number' 
            placeholder={props.schema.placeholder} 
            name={props.property} 
            value={state}
            onChange={onChange}
        ></input>
    </div>
}

