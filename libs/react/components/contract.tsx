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
import { SchemaComponentProperties } from './schema'
import { TContract } from '@sidewinder/contract'
import { FunctionComponent } from './function'


let ordinal = 0
export function nextOrdinal() {
    return ordinal++
}

export interface ContractComponentProperties<T extends TContract> extends SchemaComponentProperties {
    schema: T
    property: string
    value?: any
    onChange: (property: string, value: any) => void
}

export function ContractComponent<T extends TContract>(props: ContractComponentProperties<T>) {
    function onChange(property: string, value: unknown) {
        props.onChange(props.property, {
            jsonrpc: 2.0,
            id: nextOrdinal().toString(),
            method: property,
            params: value
        })
    }
    return <div className='type-contract'>
        <div className='server'>
            {Object.entries(props.schema.server).map(([property, schema], index) => {
                return <div key={index} className='methods'>
                    <div className='method'>
                        <label>{property}</label>
                    </div>
                    <div className='function'>
                        <FunctionComponent
                            property={property}
                            schema={schema as any}
                            value={props.value[property]}
                            onChange={onChange}
                        />
                    </div>
                </div>
            })}
        </div>
    </div>
}