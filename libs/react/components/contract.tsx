import * as React from 'react'
import { SchemaComponentProperties } from './schema'
import { TContract } from '@sidewinder/contract'

export interface ContractComponentProperties<T extends TContract> extends SchemaComponentProperties {
    schema:   T
    property: string
    value?:   any
    onChange: (property: string, value: any) => void    
}

export function ContractComponent<T extends TContract>(props: ContractComponentProperties<T>) {
    return <div className='type-contract'>
        
    </div>
}