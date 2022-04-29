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

export enum ExtendsResult {
  Both,
  True,
  False,
}

/** Tests if one type structurally extends another  */
export namespace Extends {
  const referenceMap = new Map<string, Types.TAnySchema>()

  // https://github.com/microsoft/TypeScript/issues/48871
  function AnyOrUnknownRule<Right extends Types.TAnySchema>(right: Right) {
    if (right[Types.Kind] === 'Union' && right.anyOf.some((schema: Types.TSchema) => schema[Types.Kind] === 'Any' || schema[Types.Kind] === 'Unknown')) return true
    if (right[Types.Kind] === 'Unknown') return true
    if (right[Types.Kind] === 'Any') return true
    return false
  }
  function PrimitiveWithObjectRight<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
    // type A = boolean extends {}     ? 1 : 2 // additionalProperties: false
    // type B = boolean extends object ? 1 : 2 // additionalProperties: true
    const additionalProperties = right.additionalProperties
    const propertyLength = globalThis.Object.keys(right.properties).length
    return additionalProperties === false && propertyLength === 0
  }
  function UnionRight<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    const result = right.anyOf.some((right: Types.TSchema) => Extends(left, right) !== ExtendsResult.False)
    return result ? ExtendsResult.True : ExtendsResult.False
  }

  function Any<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    return AnyOrUnknownRule(right) ? ExtendsResult.True : ExtendsResult.Both
  }

  function Array<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) return ExtendsResult.True
    if (right[Types.Kind] === 'Object') {
      if (right.properties['length'] !== undefined && right.properties['length'][Types.Kind] === 'Number') return ExtendsResult.True
      if (globalThis.Object.keys(right.properties).length === 0) return ExtendsResult.True
    }
    if (right[Types.Kind] !== 'Array') return ExtendsResult.False
    if (left.items === undefined && right.items !== undefined) return ExtendsResult.False
    if (left.items !== undefined && right.items === undefined) return ExtendsResult.False
    if (left.items === undefined && right.items === undefined) return ExtendsResult.False
    return Extends(left.items, right.items)
  }

  function Constructor<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) return ExtendsResult.True
    if (right[Types.Kind] !== 'Constructor') return ExtendsResult.False
    if (right.parameters.length < left.parameters.length) return ExtendsResult.False
    if (Extends(left.returns, right.returns) === ExtendsResult.False) {
      return ExtendsResult.False
    }
    for (let i = 0; i < left.parameters.length; i++) {
      if (Extends(left.parameters[i], right.parameters[i]) === ExtendsResult.True) {
        return ExtendsResult.False
      }
    }
    return ExtendsResult.True
  }

  function Enum<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (right[Types.Kind] !== 'Enum') return ExtendsResult.False
    if (left.anyOf.length !== right.anyOf.length) return ExtendsResult.False
    for (let i = 0; i < left.anyOf.length; i++) {
      const innerLeft = left.anyOf[i]
      const innerRight = right.anyOf[i]
      if (innerLeft.type !== innerRight.type || innerLeft.const !== innerRight.const) return ExtendsResult.False
    }
    return ExtendsResult.True
  }

  function Function<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (right[Types.Kind] !== 'Function') return ExtendsResult.False
    if (left.parameters.length !== right.parameters.length) return ExtendsResult.False
    if (!Extends(left.returns, right.returns)) return ExtendsResult.False
    for (let i = 0; i < left.parameters.length; i++) {
      if (!Extends(left.parameters[i], right.parameters[i])) return ExtendsResult.False
    }
    return ExtendsResult.True
  }

  function Integer<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) return ExtendsResult.True
    if (right[Types.Kind] === 'Object' && PrimitiveWithObjectRight(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Number') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRight(left, right)
    }
    return ExtendsResult.False
  }

  function Literal<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (right[Types.Kind] === 'Literal') {
      return right.const === left.const ? ExtendsResult.True : ExtendsResult.False
    } else if (right[Types.Kind] === 'Any' || right[Types.Kind] === 'Unknown') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'String') {
      return typeof left.const === 'string' ? ExtendsResult.True : ExtendsResult.False
    } else if (right[Types.Kind] === 'Number') {
      return typeof left.const === 'number' ? ExtendsResult.True : ExtendsResult.False
    } else if (right[Types.Kind] === 'Boolean') {
      return typeof left.const === 'boolean' ? ExtendsResult.True : ExtendsResult.False
    } else if (right[Types.Kind] === 'Union') {
      for (const inner of right.anyOf) {
        if (Extends(left, inner)) return ExtendsResult.True
      }
    }
    return ExtendsResult.False
  }

  function Number<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) return ExtendsResult.True
    if (right[Types.Kind] === 'Object' && PrimitiveWithObjectRight(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Number') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRight(left, right)
    }
    return ExtendsResult.False
  }

  function Null<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) return ExtendsResult.True
    if (right[Types.Kind] === 'Null') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRight(left, right)
    }
    return ExtendsResult.False
  }

  function Object<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (right[Types.Kind] !== 'Object') return ExtendsResult.False
    const leftKeys = globalThis.Object.keys(left.properties)
    const rightKeys = globalThis.Object.keys(right.properties)
    if (rightKeys.length > leftKeys.length) return ExtendsResult.False
    if (!rightKeys.every((rightPropertyKey) => leftKeys.includes(rightPropertyKey))) return ExtendsResult.False
    for (const rightPropertyKey of rightKeys) {
      const innerLeft = left.properties[rightPropertyKey]
      const innerRight = right.properties[rightPropertyKey]
      if (!Extends(innerLeft, innerRight)) return ExtendsResult.False
    }
    return ExtendsResult.True
  }

  function Unknown<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    return AnyOrUnknownRule(right) ? ExtendsResult.True : ExtendsResult.Both
  }

  function Undefined<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) return ExtendsResult.True
    if (right[Types.Kind] === 'Undefined') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRight(left, right)
    }
    return ExtendsResult.False
  }

  function Boolean<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) return ExtendsResult.True
    if (right[Types.Kind] === 'Object' && PrimitiveWithObjectRight(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Boolean') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRight(left, right)
    }
    return ExtendsResult.False
  }

  function Record<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    return ExtendsResult.False
  }

  function Ref<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (!referenceMap.has(left.$ref)) throw Error(`Cannot locate referenced $id '${left.$ref}'`)
    const resolved = referenceMap.get(left.$ref)!
    return Extends(resolved, right)
  }

  function Self<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (!referenceMap.has(left.$ref)) throw Error(`Cannot locate referenced self $id '${left.$ref}'`)
    const resolved = referenceMap.get(left.$ref)!
    return Extends(resolved, right)
  }

  function String<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) return ExtendsResult.True
    if (right[Types.Kind] === 'Object' && PrimitiveWithObjectRight(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'String') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRight(left, right)
    }
    return ExtendsResult.False
  }

  function Tuple<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (right[Types.Kind] !== 'Tuple') return ExtendsResult.False
    if (left.items === undefined && right.items === undefined) return ExtendsResult.True
    if (left.items === undefined && right.items !== undefined) return ExtendsResult.False
    if (left.items !== undefined && right.items === undefined) return ExtendsResult.False
    if (left.items === undefined && right.items === undefined) return ExtendsResult.True
    if (left.minItems !== right.minItems || left.maxItems !== right.maxItems) return ExtendsResult.False
    for (let i = 0; i < left.items!.length; i++) {
      if (!Extends(left.items![i], right.items![i])) return ExtendsResult.False
    }
    return ExtendsResult.True
  }

  function Uint8Array<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (right[Types.Kind] === 'Uint8Array') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRight(left, right)
    }
    return ExtendsResult.False
  }

  function Union<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (right[Types.Kind] === 'Union') {
      const result = left.anyOf.every((left: Types.TSchema) => right.anyOf.some((right: Types.TSchema) => Extends(left, right) !== ExtendsResult.False))
      return result ? ExtendsResult.True : ExtendsResult.False
    } else {
      const result = left.anyOf.every((left: Types.TSchema) => Extends(left, right) !== ExtendsResult.False)
      return result ? ExtendsResult.True : ExtendsResult.False
    }
  }

  let recursionDepth = 0
  function Extends<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    recursionDepth += 1
    if (recursionDepth >= 1000) return ExtendsResult.True
    if (left.$id !== undefined) referenceMap.set(left.$id!, left)
    if (right.$id !== undefined) referenceMap.set(right.$id!, right)
    const resolvedRight = right[Types.Kind] === 'Self' ? referenceMap.get(right.$ref)! : right
    switch (left[Types.Kind]) {
      case 'Any':
        return Any(left, resolvedRight)
      case 'Array':
        return Array(left, resolvedRight)
      case 'Boolean':
        return Boolean(left, resolvedRight)
      case 'Constructor':
        return Constructor(left, resolvedRight)
      case 'Enum':
        return Enum(left, resolvedRight)
      case 'Function':
        return Function(left, resolvedRight)
      case 'Integer':
        return Integer(left, resolvedRight)
      case 'Literal':
        return Literal(left, resolvedRight)
      case 'Null':
        return Null(left, resolvedRight)
      case 'Number':
        return Number(left, resolvedRight)
      case 'Object':
        return Object(left, resolvedRight)
      case 'Record':
        return Record(left, resolvedRight)
      case 'Ref':
        return Ref(left, resolvedRight)
      case 'String':
        return String(left, resolvedRight)
      case 'Tuple':
        return Tuple(left, resolvedRight)
      case 'Undefined':
        return Undefined(left, resolvedRight)
      case 'Uint8Array':
        return Uint8Array(left, resolvedRight)
      case 'Union':
        return Union(left, resolvedRight)
      case 'Unknown':
        return Unknown(left, resolvedRight)
      case 'Self':
        return Self(left, resolvedRight)
      default:
        return ExtendsResult.False
    }
  }

  /** Returns ExtendsResult.True if the left schema structurally extends the right schema. */
  export function Check<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    referenceMap.clear()
    recursionDepth = 0
    return Extends(left, right)
  }
}
