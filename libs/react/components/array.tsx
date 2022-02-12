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
import { TArray } from '@sidewinder/contract'
import { SchemaComponent, SchemaComponentProperties } from './schema'
import { Default } from './default'

let ordinal = 0
function nextOrdinal() { return ordinal++ }

export interface ArrayComponentProperties<T extends TArray> extends SchemaComponentProperties {
    schema: T
    property: string
    value: Array<T['$static']>
}
interface Element {
    key: number
    value: unknown
}
export function ArrayComponent<T extends TArray = TArray>(props: ArrayComponentProperties<T>) {
    const [state, setState] = React.useState<Element[]>(props.value.map(value => ({ value, key: nextOrdinal() })))
    const [store, setStore] = React.useState(Default.Create(props.schema.items))
    function reduceState(elements: Element[]) {
        return elements.map(element => element.value)
    }

    function onDelete(index: number) {
        const next = [...state]
        next.splice(index, 1)
        props.onChange(props.property, reduceState(next))
        setState(next)
    }

    function onMoveUp(index: number) {
        if (state.length < 2 || index === 0) return
        const next = [...state]
        const temp = next[index]
        next[index] = next[index - 1]
        next[index - 1] = temp
        props.onChange(props.property, reduceState(next))
        setState(next)
    }

    function onMoveDown(index: number) {
        if (state.length < 2) return
        if(index > state.length - 2) return
        const next = [...state]
        const temp = next[index]
        next[index] = next[index + 1]
        next[index + 1] = temp
        props.onChange(props.property, reduceState(next))
        setState(next)
    }
    function onPush() {
        const next: Element[] = [...state, {key: nextOrdinal(), value: store }]
        props.onChange(props.property, reduceState(next))
        setState(next)
    }

    function onUnshift() {
        const next: Element[] = [{key: nextOrdinal(), value: store }, ...state]
        props.onChange(props.property, reduceState(next))
        setState(next)
    }

    function onPop() {
        const next: Element[] = [...state]
        next.pop()
        props.onChange(props.property, reduceState(next))
        setState(next)
    }

    function onShift() {
        const next: Element[] = [...state]
        next.shift()
        props.onChange(props.property, reduceState(next))
        setState(next)
    }

    function onStoreChange(property: string, value: unknown) {
        setStore(value)
    }

    function onChange(property: string, value: unknown) {
        const index = parseInt(property)
        const next = [...state]
        next[index].value = value
        props.onChange(props.property, reduceState(next))
        setState(next)
    }

    return <div className='type-array'>
        {props.schema.controls &&
            <div className="create">
                <div className='index'>
                    <span className='action push' onClick={() => onPush()}>push</span>
                    <span className='action unshift' onClick={() => onUnshift()}>unshift</span>
                    <span className='action pop' onClick={() => onPop()}>pop</span>
                    <span className='action shift' onClick={() => onShift()}>shift</span>
                </div>
                <div className='value'>
                    <SchemaComponent
                        property=""
                        schema={props.schema.items}
                        value={store}
                        onChange={onStoreChange}
                    />
                </div>
            </div>
        }
        <div className='elements'>
            {state.map((element, index) => {
                return <div key={element.key} className='element'>
                    {props.schema.controls &&
                        <div className='index'>
                            <span className='action delete' onClick={() => onDelete(index)}>remove</span>
                            <span className='action up' onClick={() => onMoveUp(index)}>up</span>
                            <span className='action down' onClick={() => onMoveDown(index)}>down</span>
                        </div>
                    }
                    <div className='value'>
                        <SchemaComponent
                            property={index.toString()}
                            schema={props.schema.items}
                            value={element.value}
                            onChange={onChange}
                        />
                    </div>
                </div>
            })}
        </div>
    </div>
}

