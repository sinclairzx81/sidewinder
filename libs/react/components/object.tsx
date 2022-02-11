import * as React from 'react'
import { TObject } from '@sidewinder/contract'
import { SchemaComponent as SchemaComponent } from './schema'

export interface ObjectComponentProperties<T extends TObject> {
    schema: T
    property: string
    value: T['$static']
}

export function ObjectComponent<T extends TObject = TObject>(props: ObjectComponentProperties<T>) {
    return <div className='type-object'>
        <div className='label'>
            <label>{props.property}</label>
        </div>
        <div className='properties'>
            {Object.entries(props.schema.properties).map(([property, schema], index) => {
                return <SchemaComponent key={index} property={property} schema={schema} value={props.value[property]} />
            })}
        </div>
    </div>
}

