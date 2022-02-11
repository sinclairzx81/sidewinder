import { TBoolean } from '@sidewinder/contract'
import * as React from 'react'

export interface BooleanComponentProperties<T extends TBoolean> {
    schema: T
    property: string
    value: T['$static']
}

export function BooleanComponent<T extends TBoolean>(props: BooleanComponentProperties<T>) {
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        
    }
    return <div className='type-boolean'>
        <div className='label'>
        <label>{props.property}</label>
        </div>
        <div className='input'>
            <input type='checkbox' 
                placeholder={props.schema.placeholder} 
                name={props.property} 
                checked={props.value}
                onChange={onChange}
            ></input>
        </div>
    </div>
}

