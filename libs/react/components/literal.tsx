import * as React from 'react'
import { TLiteral } from '@sidewinder/contract'
import { SchemaComponentProperties } from './schema'


export interface LiteralComponentProperties<T extends TLiteral> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function LiteralComponent<T extends TLiteral>(props: LiteralComponentProperties<T>) {
    return <div className='type-literal'>
        <div className='label'>
            <label>{props.property}</label>
        </div>
        <div className='input'>
            <span>{props.value}</span>
        </div>
    </div>
}

