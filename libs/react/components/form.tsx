import * as React from 'react'
import { TSchema } from '@sidewinder/contract'
import { SchemaComponent } from './schema'
import { Default } from '.'

export interface FormProperties<T extends TSchema> {
    schema: T
    value?: T['$schema']
    onChange?: (value: T['$static']) => void
}

export function Form<T extends TSchema>(props: FormProperties<T>) {
    const [state, setState] = React.useState(props.value === undefined ? Default.Create(props.schema) : props.value)
    function onChange(property: string, value: unknown) {
        setState(value)
        
        if(!props.onChange) return
        props.onChange(value)
        
    }
    return <SchemaComponent property={''} schema={props.schema} value={state} onChange={onChange} />
}