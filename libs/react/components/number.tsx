import { TNumber } from '@sidewinder/contract'
import * as React from 'react'

export interface NumberComponentProperties<T extends TNumber> {
    schema: T
    property: string
    value: T['$static']
}

export function NumberComponent<T extends TNumber>(props: NumberComponentProperties<T>) {
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        
    }
    return <div className='type-number'>
        <div className='label'>
            <label>{props.property}</label>
        </div>
        <div className='input'>
            <input type='number' 
                placeholder={props.schema.placeholder} 
                name={props.property} 
                value={props.value}
                onChange={onChange}
            ></input>
        </div>
    </div>
}

