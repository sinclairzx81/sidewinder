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
import { TTuple } from '@sidewinder/contract'
import { SchemaComponentProperties } from './schema'
import { SchemaComponent } from './schema'

export interface TupleComponentProperties<T extends TTuple<any[]>> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function TupleComponent<T extends TTuple<any[]>>(props: TupleComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    
    async function onChange(property: string, value: unknown) {
        const index = parseInt(property)
        const next = [...state]
        next[index] = value
        props.onChange(props.property, next)
        setState(next) 
    }

    return <div className='type-tuple'>
        <div className='elements'>
            {props.schema.items!.map((schema, index) => {
                return <div key={index} className='element'>
                    <SchemaComponent
                        property={index.toString()}
                        schema={schema}
                        value={state[index]}
                        onChange={onChange}
                    />
                </div>
            })}
        </div>
    </div>
}

