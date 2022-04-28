/*--------------------------------------------------------------------------

@sidewinder/type

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

import * as Types from './type'

export namespace Extends {
    const referenceMap = new Map<string, Types.TAnySchema>()
    let recursionDepth = 0
  
    function Any<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      return true
    }
  
    function Array<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (right[Types.Kind] !== 'Array') return false
      if (left.items === undefined && right.items !== undefined) return false
      if (left.items !== undefined && right.items === undefined) return false
      if (left.items === undefined && right.items === undefined) return true
      return Extends(left.items, right.items)
    }
  
    function Constructor<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (right[Types.Kind] !== 'Constructor') return false
      if (left.parameters.length !== right.parameters.length) return false
      if (!Extends(left.returns, right.returns)) return false
      for (let i = 0; i < left.parameters.length; i++) {
        if (!Extends(left.parameters[i], right.parameters[i])) return false
      }
      return true
    }
  
    function Enum<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (right[Types.Kind] !== 'Enum') return false
      if (left.anyOf.length !== right.anyOf.length) return false
      for (let i = 0; i < left.anyOf.length; i++) {
        const innerLeft = left.anyOf[i]
        const innerRight = right.anyOf[i]
        if (innerLeft.type !== innerRight.type || innerLeft.const !== innerRight.const) return false
      }
      return true
    }
  
    function Function<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (right[Types.Kind] !== 'Function') return false
      if (left.parameters.length !== right.parameters.length) return false
      if (!Extends(left.returns, right.returns)) return false
      for (let i = 0; i < left.parameters.length; i++) {
        if (!Extends(left.parameters[i], right.parameters[i])) return false
      }
      return true
    }
  
    function Integer<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (
        right[Types.Kind] === 'Any' ||
        right[Types.Kind] === 'Unknown' ||
        right[Types.Kind] === 'Integer'
      ) {
        return true
      } else if (right[Types.Kind] === 'Union') {
        for (const inner of right.anyOf) {
          if (Extends(left, inner)) return true
        }
      }
      return false
    }
  
    function Literal<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (right[Types.Kind] === 'Literal') {
        return right.const === left.const
      } else if (
        right[Types.Kind] === 'Any' ||
        right[Types.Kind] === 'Unknown'
      ) {
        return true
      } else if (right[Types.Kind] === 'String') {
        return typeof left.const === 'string'
      } else if (right[Types.Kind] === 'Number') {
        return typeof left.const === 'number'
      } else if (right[Types.Kind] === 'Boolean') {
        return typeof left.const === 'boolean'
      } else if (right[Types.Kind] === 'Union') {
        for (const inner of right.anyOf) {
          if (Extends(left, inner)) return true
        }
      }
      return false
    }
  
    function Number<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (
        right[Types.Kind] === 'Any' ||
        right[Types.Kind] === 'Unknown' ||
        right[Types.Kind] === 'Number'
      ) {
        return true
      } else if (right[Types.Kind] === 'Union') {
        for (const inner of right.anyOf) {
          if (Extends(left, inner)) return true
        }
      }
      return false
    }
  
    function Null<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (
        right[Types.Kind] === 'Any' ||
        right[Types.Kind] === 'Unknown' ||
        right[Types.Kind] === 'Null'
      ) {
        return true
      } else if (right[Types.Kind] === 'Union') {
        for (const inner of right.anyOf) {
          if (Extends(left, inner)) return true
        }
      }
      return false
    }
  
    function Object<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (right[Types.Kind] !== 'Object') return false
      const leftPropertyKeys = globalThis.Object.keys(left.properties)
      const rightPropertyKeys = globalThis.Object.keys(right.properties)
      if (rightPropertyKeys.length > leftPropertyKeys.length) return false
      if (!rightPropertyKeys.every(rightPropertyKey => leftPropertyKeys.includes(rightPropertyKey))) return false
      for (const rightPropertyKey of rightPropertyKeys) {
        const innerLeft = left.properties[rightPropertyKey]
        const innerRight = right.properties[rightPropertyKey]
        if (!Extends(innerLeft, innerRight)) return false
  
      }
      return true
    }
  
    function Unknown<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      return right[Types.Kind] === 'Unknown' || right[Types.Kind] === 'Any'
    }
  
    function Undefined<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (
        right[Types.Kind] === 'Any' ||
        right[Types.Kind] === 'Unknown' ||
        right[Types.Kind] === 'Undefined'
      ) {
        return true
      } else if (right[Types.Kind] === 'Union') {
        for (const inner of right.anyOf) {
          if (Extends(left, inner)) return true
        }
      }
      return false
    }
  
    function Boolean<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (
        right[Types.Kind] === 'Any' ||
        right[Types.Kind] === 'Unknown' ||
        right[Types.Kind] === 'Boolean'
      ) {
        return true
      } else if (right[Types.Kind] === 'Union') {
        for (const inner of right.anyOf) {
          if (Extends(left, inner)) return true
        }
      }
      return false
    }
  
    function Record<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      return false
    }
  
    function Ref<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (!referenceMap.has(left.$ref)) throw Error(`Cannot locate referenced $id '${left.$ref}'`)
      const resolved = referenceMap.get(left.$ref)!
      return Extends(resolved, right)
    }
  
    function Self<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (!referenceMap.has(left.$ref)) throw Error(`Cannot locate referenced self $id '${left.$ref}'`)
      const resolved = referenceMap.get(left.$ref)!
      return Extends(resolved, right)
    }
  
    function String<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (
        right[Types.Kind] === 'Any' ||
        right[Types.Kind] === 'Unknown' ||
        right[Types.Kind] === 'String'
      ) {
        return true
      } else if (right[Types.Kind] === 'Union') {
        for (const inner of right.anyOf) {
          if (Extends(left, inner)) return true
        }
      }
      return false
    }
  
    function Tuple<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (right[Types.Kind] !== 'Tuple') return false
      if (left.items === undefined && right.items === undefined) return true
      if (left.items === undefined && right.items !== undefined) return false
      if (left.items !== undefined && right.items === undefined) return false
      if (left.items === undefined && right.items === undefined) return true
      if (left.minItems !== right.minItems || left.maxItems !== right.maxItems) return false
      for (let i = 0; i < left.items!.length; i++) {
        if (!Extends(left.items![i], right.items![i])) return false
      }
      return true
    }
  
    function Uint8Array<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      return right[Types.Kind] === 'Uint8Array'
    }
  
    function Union<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
      if (right[Types.Kind] === 'Union') {
        for (const innerLeft of left.anyOf) {
          for (const innerRight of right.anyOf) {
            if (!Extends(innerLeft, innerRight)) return false
          }
        }
      } else {
        for (const innerLeft of left.anyOf) {
          if (!Extends(innerLeft, right)) return false
        }
      }
      return true
    }
  
    function Extends<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): boolean {
      recursionDepth += 1; if (recursionDepth > 1000) return true
  
      if (left.$id !== undefined) referenceMap.set(left.$id!, left)
      if (right.$id !== undefined) referenceMap.set(right.$id!, right)
      const resolvedRight = right[Types.Kind] === 'Self' ? referenceMap.get(right.$ref)! : right
  
      switch (left[Types.Kind]) {
        case 'Any': return Any(left, resolvedRight)
        case 'Array': return Array(left, resolvedRight)
        case 'Boolean': return Boolean(left, resolvedRight)
        case 'Constructor': return Constructor(left, resolvedRight)
        case 'Enum': return Enum(left, resolvedRight)
        case 'Function': return Function(left, resolvedRight)
        case 'Integer': return Integer(left, resolvedRight)
        case 'Literal': return Literal(left, resolvedRight)
        case 'Null': return Null(left, resolvedRight)
        case 'Number': return Number(left, resolvedRight)
        case 'Object': return Object(left, resolvedRight)
        case 'Record': return Record(left, resolvedRight)
        case 'Ref': return Ref(left, resolvedRight)
        case 'String': return String(left, resolvedRight)
        case 'Tuple': return Tuple(left, resolvedRight)
        case 'Undefined': return Undefined(left, resolvedRight)
        case 'Uint8Array': return Uint8Array(left, resolvedRight)
        case 'Union': return Union(left, resolvedRight)
        case 'Unknown': return Unknown(left, resolvedRight)
        case 'Self': return Self(left, resolvedRight)
        default: return false
      }
    }
  
    /** Returns true if the left schema structurally extends the right schema. */
    export function Check<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): boolean {
      referenceMap.clear()
      recursionDepth = 0
      return Extends(left, right)
    }
  }