/*--------------------------------------------------------------------------

@sidewinder/react

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import * as React from 'react'
import { TObject, TString, TBoolean, TNumber, TArray, TLiteral, TUnion, TTuple, TIntersect, TInteger, TContract, TFunction } from '@sidewinder/contract'
import { TSchema }            from '@sidewinder/contract'
import { ArrayComponent }     from './array'
import { ObjectComponent }    from './object'
import { BooleanComponent }   from './boolean'
import { StringComponent }    from './string'
import { NumberComponent }    from './number'
import { LiteralComponent }   from './literal'
import { UnionComponent }     from './union'
import { TupleComponent }     from './tuple'
import { IntersectComponent } from './intersect'
import { IntegerComponent }   from './integer'
import { ContractComponent }  from './contract'
import { FunctionComponent }  from './function'

export interface SchemaComponentProperties {
    schema:   TSchema
    property: string
    value?:   any
    onChange: (property: string, value: any) => void
}

export function SchemaComponent(props: SchemaComponentProperties) {
    switch(props.schema.kind) {
        case 'Array':    return <ArrayComponent     property={props.property} schema={props.schema as TArray}  value={props.value}  onChange={props.onChange} />
        case 'Boolean':  return <BooleanComponent  property={props.property} schema={props.schema as TBoolean} value={props.value} onChange={props.onChange} />
        case 'Contract': return <ContractComponent property={props.property} schema={props.schema as TContract} value={props.value} onChange={props.onChange} />
        case 'Integer':  return <IntegerComponent  property={props.property} schema={props.schema as TInteger} value={props.value} onChange={props.onChange} />
        case 'Intersect':return <IntersectComponent  property={props.property} schema={props.schema as TIntersect} value={props.value} onChange={props.onChange} />
        case 'Function': return <FunctionComponent property={props.property} schema={props.schema as TFunction} value={props.value} onChange={props.onChange} />
        case 'Literal':  return <LiteralComponent   property={props.property} schema={props.schema as TLiteral} value={props.value} onChange={props.onChange} />
        case 'Object':   return <ObjectComponent    property={props.property} schema={props.schema as TObject} value={props.value} onChange={props.onChange} />
        case 'String':   return <StringComponent    property={props.property} schema={props.schema as TString} value={props.value} onChange={props.onChange} />
        case 'Number':   return <NumberComponent    property={props.property} schema={props.schema as TNumber} value={props.value} onChange={props.onChange} />
        case 'Union':    return <UnionComponent    property={props.property} schema={props.schema as TUnion} value={props.value} onChange={props.onChange} />
        case 'Tuple':    return <TupleComponent    property={props.property} schema={props.schema as TTuple} value={props.value} onChange={props.onChange} />
        default: throw Error(`SchemaComponent: Unknown schema kind '${props.schema.kind}'`)
    }
}

