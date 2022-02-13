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
import { TNumber } from '@sidewinder/contract'
import { SchemaComponentProperties } from './schema'


export interface NumberComponentProperties<T extends TNumber> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function NumberComponent<T extends TNumber>(props: NumberComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = (e.target.value === '' || e.target.value === null) ? '0' : e.target.value
        const next = parseFloat(value)
        props.onChange(props.property, next)
        setState(next)
    }
    return <div className='type-number'>
        <input type='number' 
            placeholder={props.schema.placeholder} 
            name={props.property} 
            value={state}
            onChange={onChange}
        ></input>
    </div>
}

