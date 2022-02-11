import { TString } from '@sidewinder/contract'
import { SchemaComponentProperties} from './schema'
import * as React from 'react'

export interface StringComponentProperties<T extends TString> extends SchemaComponentProperties {
    schema:   T
    property: string
    value:    T['$static']
}

export function StringComponent<T extends TString>(props: StringComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        props.onChange(props.property, e.target.value)
        setState(() => e.target.value)
    }
    return <div className='type-string'>
        <label>{props.property}</label>
        <input type='string' 
            placeholder={props.schema.placeholder} 
            name={props.property} 
            value={state}
            onChange={onChange}
        ></input>
    </div>
}

