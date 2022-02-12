import * as React from 'react'
import { TArray } from '@sidewinder/contract'
import { SchemaComponent, SchemaComponentProperties } from './schema'
import { Default } from './default'
export interface ArrayComponentProperties<T extends TArray> extends SchemaComponentProperties {
    schema: T
    property: string
    value: Array<T['$static']>
}

export function ArrayComponent<T extends TArray = TArray>(props: ArrayComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(property: string, value: any) {
        const index = parseInt(property)
        const next = [...state]
        next[index] = value
        props.onChange(property, next)
        setState(next)
    }
    return <div className='type-array'>
        <div className="create">
            <SchemaComponent
                property=""
                schema={props.schema.items}
                value={Default.Create(props.schema.items)}
                onChange={() => { }}
            />
        </div>
        <div className='elements'>
            {props.value.map((value, index) => {
                return <div key={index} className='element'>
                    <div className='index'>
                        <span>[{index}]</span>
                    </div>
                    <div className='value'>
                    <SchemaComponent
                        property={index.toString()}
                        schema={props.schema.items}
                        value={value}
                        onChange={onChange}
                    />
                    </div>
                </div>
            })}

        </div>
    </div>
}

