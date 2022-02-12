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
import { TIntersect } from '@sidewinder/contract'
import { SchemaComponent, SchemaComponentProperties } from './schema'

export interface IntersectComponentProperties<T extends TIntersect> extends SchemaComponentProperties {
    schema: T
    property: string
    value: T['$static']
}

export function IntersectComponent<T extends TIntersect = TIntersect>(props: IntersectComponentProperties<T>) {
    const [state, setState] = React.useState(props.value)
    function onChange(property: string, value: any) {
        const next = { ...(state as any), [property]: value }
        setState(next)
        props.onChange(props.property, next)
    }
    return <div className='type-intersect'>
        <div className='properties'>
            {props.schema.allOf.map(schema => {
                 return Object.entries(schema.properties).map(([property, schema], index) => {
                    return <div key={index} className='property'>
                        <div className='key'>
                            <label>{property}</label>
                        </div>
                        <div className='value'>
                            <SchemaComponent
                                property={property}
                                schema={schema as any}
                                value={(props.value as any)[property] as any}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                })
            })}
        </div>
    </div>
}

