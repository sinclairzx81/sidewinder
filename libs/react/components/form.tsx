import * as React from 'react'
import { TSchema } from '@sidewinder/contract'
import { SchemaComponent } from './schema'

export interface FormProperties<T extends TSchema> {
    schema: T
    value?: T['$schema']
    onChange?: (value: T['$static']) => void
}

export function Form<T extends TSchema>(props: FormProperties<T>) {
    function onChange(property: string, value: unknown) {
        if(!props.onChange) return
        props.onChange(value)
    }
    return <SchemaComponent property={''} schema={props.schema} value={props.value} onChange={onChange} />
}