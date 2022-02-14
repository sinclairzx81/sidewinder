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
import { SchemaComponent, SchemaComponentProperties } from './schema'
import { TFunction } from '@sidewinder/contract'
import { Default } from './default'

export interface FunctionComponentProperties<T extends TFunction> {
    schema:   T
    method: string
    onCall: (method: string, params: unknown[]) => void    
}

export function FunctionComponent<T extends TFunction>(props: FunctionComponentProperties<T>) {
    const [state, setState] = React.useState(props.schema.parameters.map(schema => Default.Create(schema)))
    function onChange(property: string, value: unknown) {
        const index = parseInt(property)
        const params = [...state]
        params[index] =  value
        setState(params)
    }
    function onCall() {
        props.onCall(props.method, state)
    }
    return <div className='type-function'>
        <div className='parameters'>
            {props.schema.parameters.map((schema, index) => {
                return <div key={index} className='parameter'>
                    <div className='name'>
                        arg{index}
                    </div>
                    <div className='value'>
                    <SchemaComponent
                        property={index.toString()}
                        schema={schema}
                        value={Default.Create(schema)}
                        onChange={onChange}
                        />
                    </div>
                </div>
            })}
        </div>
        <div className='returns'>
            <span className='action call' onClick={onCall}>call</span>
        </div>
    </div>
}