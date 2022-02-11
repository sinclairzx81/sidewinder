import { TString } from '@sidewinder/contract'
import * as React from 'react'

export interface StringComponentProperties<T extends TString> {
    schema:   T
    property: string
    value:    T['$static']
}

export function StringComponent<T extends TString>(props: StringComponentProperties<T>) {
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        
    }
    return <div className='type-string'>
        <label>{props.property}</label>
        <input type='string' 
            placeholder={props.schema.placeholder} 
            name={props.property} 
            value={props.value}
            onChange={onChange}
        ></input>
    </div>
}

