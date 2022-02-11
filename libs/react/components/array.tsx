import { TArray } from '@sidewinder/contract'
import { SchemaComponent } from './schema'
import * as React from 'react'

export interface ArrayComponentProperties<T extends TArray> {
    schema: T
    property: string
    value: Array<T['$static']>
}

export function ArrayComponent<T extends TArray = TArray>(props: ArrayComponentProperties<T>) {
    return <div className='type-array'>
        <div className='label'>
            <label>{props.property}</label>
        </div>
        <div className='elements'>
            {props.value.map((value, index) => {
                return <SchemaComponent key={index} property={index.toString()} schema={props.schema.items} value={value} />
            })}
        </div>
    </div>
}

