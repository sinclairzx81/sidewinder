import * as React from 'react'
import { SchemaComponent, SchemaComponentProperties } from './schema'
import { TFunction } from '@sidewinder/contract'
import { Default } from './default'

export interface FunctionComponentProperties<T extends TFunction> extends SchemaComponentProperties {
    schema:   T
    property: string
    value?:   any
    onChange: (property: string, value: any) => void    
}

export function FunctionComponent<T extends TFunction>(props: FunctionComponentProperties<T>) {
    function onChange(property: string, value: unknown) {
        console.log(property, value)
    }
    return <div className='type-function'>
        <div className='parameters'>
            {props.schema.parameters.map((schema, index) => {
                return <div key={index} className='parameter'>
                    <div className='name'>
                        params_{index}
                    </div>
                    <div className='value'>
                    <SchemaComponent
                        property={index.toString()}
                        schema={schema}
                        value={Default.Create(schema)}
                        onChange={onChange}
                        />
                    </div>
                </div>
            })}
        </div>
        <div className='returns'>

        </div>
    </div>
}