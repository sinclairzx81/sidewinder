import * as React from 'react'
import { TIntersect } from '@sidewinder/contract'
import { SchemaComponent, SchemaComponentProperties } from './schema'

export interface IntersectComponentProperties<T extends TIntersect> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function IntersectComponent<T extends TIntersect = TIntersect>(props: IntersectComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(property: string, value: any) {
        const next = { ...(state as any), [property]: value }
        setState(next)
        props.onChange(props.property, next)
    }
    return <div className='type-intersect'>
        <div className='properties'>
            {props.schema.allOf.map(schema => {
                 return Object.entries(schema.properties).map(([property, schema], index) => {
                    return <div key={index} className='property'>
                        <div className='key'>
                            <label>{property}</label>
                        </div>
                        <div className='value'>
                            <SchemaComponent
                                property={property}
                                schema={schema as any}
                                value={(props.value as any)[property] as any}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                })
            })}
        </div>
    </div>
}

