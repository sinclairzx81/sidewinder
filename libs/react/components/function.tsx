import * as React from 'react'
import { SchemaComponentProperties } from './schema'
import { TFunction } from '@sidewinder/contract'

export interface FunctionComponentProperties<T extends TFunction> extends SchemaComponentProperties {
    schema:   T
    property: string
    value?:   any
    onChange: (property: string, value: any) => void    
}

export function FunctionComponent<T extends TFunction>(props: FunctionComponentProperties<T>) {
    return <div className='type-function'>
        
    </div>
}