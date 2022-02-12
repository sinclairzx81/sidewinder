import * as React from 'react'
import { TNumber } from '@sidewinder/contract'
import { SchemaComponentProperties } from './schema'


export interface NumberComponentProperties<T extends TNumber> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function NumberComponent<T extends TNumber>(props: NumberComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        props.onChange(props.property, e.target.value)
        setState(() => parseFloat(e.target.value))
    }
    return <div className='type-number'>
        <input type='number' 
            placeholder={props.schema.placeholder} 
            name={props.property} 
            value={state}
            onChange={onChange}
        ></input>
    </div>
}

