import * as React from 'react'
import { TArray } from '@sidewinder/contract'
import { SchemaComponent, SchemaComponentProperties } from './schema'

export interface ArrayComponentProperties<T extends TArray> extends SchemaComponentProperties {
    schema: T
    property: string
    value: Array<T['$static']>
}

export function ArrayComponent<T extends TArray = TArray>(props: ArrayComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(property: string, value: any) {
        
    }
    return <div className='type-array'>
        <div className='label'>
            <label>{props.property}</label>
        </div>
        <div className='elements'>
            {props.value.map((value, index) => {
                return <SchemaComponent 
                    key={index} 
                    property={index.toString()} 
                    schema={props.schema.items} 
                    value={value}
                    onChange={onChange} 
                />
            })}
        </div>
    </div>
}

