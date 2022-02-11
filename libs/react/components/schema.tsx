import * as React from 'react'
import { TObject, TString, TBoolean, TNumber, TArray } from '@sidewinder/contract'
import { TSchema }          from '@sidewinder/contract'
import { ArrayComponent }   from './array'
import { ObjectComponent }  from './object'
import { BooleanComponent } from './boolean'
import { StringComponent }  from './string'
import { NumberComponent }  from './number'

export interface SchemaComponentProperties {
    schema:   TSchema
    property: string
    value?:   any
    onChange: (property: string, value: any) => void
}

export function SchemaComponent(props: SchemaComponentProperties) {
    switch(props.schema.kind) {
        case 'Object':  return <ObjectComponent    property={props.property} schema={props.schema as TObject} value={props.value} onChange={props.onChange} />
        case 'Array':   return <ArrayComponent     property={props.property} schema={props.schema as TArray}  value={props.value}  onChange={props.onChange} />
        case 'String':  return <StringComponent    property={props.property} schema={props.schema as TString} value={props.value} onChange={props.onChange} />
        case 'Number':  return <NumberComponent    property={props.property} schema={props.schema as TNumber} value={props.value} onChange={props.onChange} />
        case 'Boolean': return <BooleanComponent  property={props.property} schema={props.schema as TBoolean} value={props.value} onChange={props.onChange} />
        default: throw Error(`unknown schema kind '${props.schema.kind}'`)
    }
}

