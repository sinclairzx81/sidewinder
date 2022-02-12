import * as React from 'react'
import { TUnion } from '@sidewinder/contract'
import { SchemaComponentProperties } from './schema'
import { Default } from './default'

function isRenderable<T extends TUnion>(union: T) {
    return union.anyOf.every(schema => schema.kind === 'Literal')
}

export interface UnionComponentProperties<T extends TUnion> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function UnionComponent<T extends TUnion>(props: UnionComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    
    async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        props.onChange(props.property, e.target.value)
        setState(e.target.value) 
    }
    
    if(isRenderable(props.schema)) {
        return <div className='type-union'>
            <select onChange={onChange} value={state as any}>
                {props.schema.anyOf.map((schema, index) => {
                    return <option key={index}>{Default.Create(schema) as any}</option>
                })}
            </select>
        </div>
    } else {
        return <div className='type-union'>
            <span>Can only render unions of literal values</span>
        </div>
    }
}

