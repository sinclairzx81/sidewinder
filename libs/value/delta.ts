/*--------------------------------------------------------------------------

@sidewinder/value

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

import { Reflect, TypeName } from './reflect'
import { Pointer } from './pointer'
import { CloneValue } from './clone'

// --------------------------------------------------------------------------
// FlatValue
//
// Flattens a value into a Iterator of [PointerRef, FlatValueEntry]. This
// is used to construct a Map<PointerRef, FlatValueEntry> for computing
// deltas between values.
// --------------------------------------------------------------------------
type PointerRef = string

type FlatValueEntry = {
  type: TypeName
  value: any
}
namespace FlatValue {
  function* Undefined(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'undefined', value }]
  }
  function* Null(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'null', value }]
  }
  function* Function(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'function', value }]
  }
  function* Object(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'object', value }]
    for (const entry of globalThis.Object.entries(value)) {
      yield* Visit(`${key}/${entry[0]}`, entry[1])
    }
  }
  function* Array(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'array', value }]
    for (let i = 0; i < value.length; i++) {
      yield* Visit(`${key}/${i}`, value[i])
    }
  }
  function* BigInt(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'bigint', value }]
  }
  function* Symbol(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'symbol', value }]
  }
  function* String(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'string', value }]
  }
  function* Boolean(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'boolean', value }]
  }
  function* Number(key: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    yield [key, { type: 'number', value }]
  }
  function* Visit(path: string, value: any): Iterable<[PointerRef, FlatValueEntry]> {
    switch (Reflect(value)) {
      case 'array':
        return yield* Array(path, value)
      case 'bigint':
        return yield* BigInt(path, value)
      case 'boolean':
        return yield* Boolean(path, value)
      case 'function':
        return yield* Function(path, value)
      case 'null':
        return yield* Null(path, value)
      case 'number':
        return yield* Number(path, value)
      case 'object':
        return yield* Object(path, value)
      case 'string':
        return yield* String(path, value)
      case 'symbol':
        return yield* Symbol(path, value)
      case 'undefined':
        return yield* Undefined(path, value)
    }
  }
  export function* Create(value: any) {
    return yield* Visit('', value)
  }
}

export type Insert = { type: 'insert'; key: string; value: any }
export type Update = { type: 'update'; key: string; value: any }
export type Delete = { type: 'delete'; key: string }
export type Edit = Insert | Update | Delete

export namespace DeltaValue {
  function IsRootUpdate(operations: Edit[]): operations is [Update] {
    return operations.length > 0 && operations[0].key === '' && operations[0].type === 'update'
  }
  function IsNullUpdate(operations: Edit[]) {
    return operations.length === 0
  }
  function* Updates(mapA: Map<string, FlatValueEntry>, mapB: Map<string, FlatValueEntry>): Iterable<Update> {
    for (const [key, entry] of mapB) {
      if (!mapA.has(key)) continue
      const entryA = mapA.get(key)!
      const entryB = entry
      if (entryA.value === entryB.value) continue
      if (entryA.type === 'object' && entryB.type === 'object') continue
      if (entryA.type === 'array' && entryB.type === 'array') continue
      yield { type: 'update', key, value: entry.value }
    }
  }
  function* Inserts(mapA: Map<string, FlatValueEntry>, mapB: Map<string, FlatValueEntry>, updates: Update[]): Iterable<Insert> {
    const discards = [] as string[]
    for (const [keyB, entryB] of mapB) {
      if (discards.some((ignore) => keyB.indexOf(ignore) === 0)) continue
      if (updates.some((update) => keyB.indexOf(update.key) === 0)) continue
      if (mapA.has(keyB)) continue
      if (entryB.type === 'object' || entryB.type === 'array') discards.push(keyB)
      yield { type: 'insert', key: keyB, value: entryB.value }
    }
  }
  function* Deletes(mapA: Map<string, FlatValueEntry>, mapB: Map<string, FlatValueEntry>): Iterable<Delete> {
    const discards = [] as string[]
    for (const [keyA, entryA] of mapA) {
      if (discards.some((discard) => keyA.indexOf(discard) === 0)) continue
      if (mapB.has(keyA)) continue
      if (entryA.type === 'object' || entryA.type === 'array') discards.push(keyA)
      yield { type: 'delete', key: keyA }
    }
  }
  export function Diff(a: any, b: any): Edit[] {
    const mapA = new Map(FlatValue.Create(a))
    const mapB = new Map(FlatValue.Create(b))
    const updates = [...Updates(mapA, mapB)]
    const inserts = [...Inserts(mapA, mapB, updates)]
    const deletes = [...Deletes(mapA, mapB)].reverse()
    return [...updates, ...inserts, ...deletes]
  }
  export function Edit(current: any, operations: Edit[]) {
    if (IsRootUpdate(operations)) {
      return CloneValue.Create(operations[0].value)
    }
    if (IsNullUpdate(operations)) {
      return CloneValue.Create(current)
    }
    const patch = CloneValue.Create(current)
    for (const operation of operations) {
      switch (operation.type) {
        case 'insert': {
          Pointer.Set(patch, operation.key, operation.value)
          break
        }
        case 'update': {
          Pointer.Set(patch, operation.key, operation.value)
          break
        }
        case 'delete': {
          Pointer.Delete(patch, operation.key)
          break
        }
      }
    }
    return patch
  }
}
