import * as React from 'react'
import { TObject } from '@sidewinder/contract'
import { SchemaComponent, SchemaComponentProperties } from './schema'

export interface ObjectComponentProperties<T extends TObject> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function ObjectComponent<T extends TObject = TObject>(props: ObjectComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(property: string, value: any) {
        const next = { ...state, [property]: value }
        setState(next)
        props.onChange(props.property, next)
    }
    return <div className='type-object'>
        <div className='properties'>
            {Object.entries(props.schema.properties).map(([property, schema], index) => {
                return <div key={index} className='property'>
                    <div className='key'>
                        <label>{property}</label>
                    </div>
                    <div className='value'>
                        <SchemaComponent
                            property={property}
                            schema={schema}
                            value={props.value[property]}
                            onChange={onChange}
                        />
                    </div>
                </div>
            })}
        </div>
    </div>
}

