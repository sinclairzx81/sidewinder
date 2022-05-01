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
  Union,
  True,
  False,
}

/** Tests if one type structurally extends another based on 4.6.3 extends rules */
export namespace Extends {
  const referenceMap = new Map<string, Types.TAnySchema>()

  // ----------------------------------------------------------------------
  // Rules
  // ----------------------------------------------------------------------

  function AnyOrUnknownRule<Right extends Types.TAnySchema>(right: Right) {
    // https://github.com/microsoft/TypeScript/issues/40049
    if (right[Types.Kind] === 'Union' && right.anyOf.some((schema: Types.TSchema) => schema[Types.Kind] === 'Any' || schema[Types.Kind] === 'Unknown')) return true
    if (right[Types.Kind] === 'Unknown') return true
    if (right[Types.Kind] === 'Any') return true
    return false
  }

  function ObjectRightRule<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right) {
    // type A = boolean extends {}     ? 1 : 2 // additionalProperties: false
    // type B = boolean extends object ? 1 : 2 // additionalProperties: true
    const additionalProperties = right.additionalProperties
    const propertyLength = globalThis.Object.keys(right.properties).length
    return additionalProperties === false && propertyLength === 0
  }

  function UnionRightRule<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    const result = right.anyOf.some((right: Types.TSchema) => Extends(left, right) !== ExtendsResult.False)
    return result ? ExtendsResult.True : ExtendsResult.False
  }

  // ----------------------------------------------------------------------
  // Records
  // ----------------------------------------------------------------------

  function RecordPattern<T extends Types.TRecord>(schema: T) {
    return globalThis.Object.keys(schema.patternProperties)[0] as string
  }

  function RecordNumberOrStringKey<T extends Types.TRecord>(schema: T) {
    const pattern = RecordPattern(schema)
    return pattern === '^.*$' || pattern === '^(0|[1-9][0-9]*)$'
  }

  export function RecordKey<T extends Types.TRecord>(schema: T) {
    const pattern = RecordPattern(schema)
    if (pattern === '^.*$') {
      return Types.Type.String()
    } else if (pattern === '^(0|[1-9][0-9]*)$') {
      return Types.Type.Number()
    } else {
      const keys = pattern.slice(1, pattern.length - 1).split('|')
      const schemas = keys.map((key) => (isNaN(+key) ? Types.Type.Literal(key) : Types.Type.Literal(parseFloat(key))))
      return Types.Type.Union(schemas)
    }
  }

  function PropertyMap<T extends Types.TAnySchema>(schema: T) {
    const comparable = new Map<string, Types.TSchema>()
    if (schema[Types.Kind] === 'Record') {
      const propertyPattern = RecordPattern(schema as Types.TRecord)
      if (propertyPattern === '^.*$' || propertyPattern === '^(0|[1-9][0-9]*)$') throw Error('Cannot extract record properties without property constraints')
      const propertySchema = schema.patternProperties[propertyPattern] as Types.TSchema
      const propertyKeys = propertyPattern.slice(1, propertyPattern.length - 1).split('|')
      propertyKeys.forEach((propertyKey) => {
        comparable.set(propertyKey, propertySchema)
      })
    } else if (schema[Types.Kind] === 'Object') {
      globalThis.Object.entries(schema.properties).forEach(([propertyKey, propertySchema]) => {
        comparable.set(propertyKey, propertySchema as Types.TSchema)
      })
    } else {
      throw Error(`Cannot create property map from '${schema[Types.Kind]}' types`)
    }
    return comparable
  }

  // ----------------------------------------------------------------------
  // Checks
  // ----------------------------------------------------------------------

  function Any<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    return AnyOrUnknownRule(right) ? ExtendsResult.True : ExtendsResult.Union
  }

  function Array<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object') {
      if (right.properties['length'] !== undefined && right.properties['length'][Types.Kind] === 'Number') return ExtendsResult.True
      if (globalThis.Object.keys(right.properties).length === 0) return ExtendsResult.True
      return ExtendsResult.False
    } else if (right[Types.Kind] !== 'Array') {
      return ExtendsResult.False
    } else if (left.items === undefined && right.items !== undefined) {
      return ExtendsResult.False
    } else if (left.items !== undefined && right.items === undefined) {
      return ExtendsResult.False
    } else if (left.items === undefined && right.items === undefined) {
      return ExtendsResult.False
    } else {
      const result = Extends(left.items, right.items) !== ExtendsResult.False
      return result ? ExtendsResult.True : ExtendsResult.False
    }
  }
  function Boolean<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object' && ObjectRightRule(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Boolean') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRightRule(left, right)
    } else {
      return ExtendsResult.False
    }
  }
  function Constructor<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] !== 'Constructor') {
      return ExtendsResult.False
    } else if (right.parameters.length < left.parameters.length) {
      return ExtendsResult.False
    } else {
      if (Extends(left.returns, right.returns) === ExtendsResult.False) {
        return ExtendsResult.False
      }
      for (let i = 0; i < left.parameters.length; i++) {
        const result = Extends(right.parameters[i], left.parameters[i])
        if (result === ExtendsResult.False) return ExtendsResult.False
      }
      return ExtendsResult.True
    }
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
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] !== 'Function') {
      return ExtendsResult.False
    } else if (right.parameters.length < left.parameters.length) {
      return ExtendsResult.False
    } else if (Extends(left.returns, right.returns) === ExtendsResult.False) {
      return ExtendsResult.False
    } else {
      for (let i = 0; i < left.parameters.length; i++) {
        const result = Extends(right.parameters[i], left.parameters[i])
        if (result === ExtendsResult.False) return ExtendsResult.False
      }
      return ExtendsResult.True
    }
  }

  function Integer<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object' && ObjectRightRule(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Number') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRightRule(left, right)
    } else {
      return ExtendsResult.False
    }
  }

  function Literal<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object' && ObjectRightRule(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Literal' && left.const === right.const) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'String' && typeof left.const === 'string') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Number' && typeof left.const === 'number') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Boolean' && typeof left.const === 'boolean') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRightRule(left, right)
    } else {
      return ExtendsResult.False
    }
  }

  function Number<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object' && ObjectRightRule(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Number') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRightRule(left, right)
    } else {
      return ExtendsResult.False
    }
  }

  function Null<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Null') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRightRule(left, right)
    } else {
      return ExtendsResult.False
    }
  }

  function Properties(left: Map<string, Types.TSchema>, right: Map<string, Types.TSchema>) {
    if (right.size > left.size) return ExtendsResult.False
    if (![...right.keys()].every((rightKey) => left.has(rightKey))) return ExtendsResult.False
    for (const rightKey of right.keys()) {
      const leftProp = left.get(rightKey)!
      const rightProp = right.get(rightKey)!
      if (Extends(leftProp, rightProp) === ExtendsResult.False) {
        return ExtendsResult.False
      }
    }
    return ExtendsResult.True
  }

  function Object<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object') {
      return Properties(PropertyMap(left), PropertyMap(right))
    } else if (right[Types.Kind] === 'Record') {
      if (!RecordNumberOrStringKey(right as Types.TRecord)) {
        return Properties(PropertyMap(left), PropertyMap(right))
      } else {
        return ExtendsResult.True
      }
    } else {
      return ExtendsResult.False
    }
  }

  function Promise<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object') {
      if (ObjectRightRule(left, right) || globalThis.Object.keys(right.properties).length === 0) {
        return ExtendsResult.True
      } else {
        return ExtendsResult.False
      }
    } else if (right[Types.Kind] !== 'Promise') {
      return ExtendsResult.False
    } else {
      const result = Extends(left.item, right.item) !== ExtendsResult.False
      return result ? ExtendsResult.True : ExtendsResult.False
    }
  }

  function Unknown<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (right[Types.Kind] === 'Union') {
      const result = right.anyOf.some((right: Types.TSchema) => right[Types.Kind] === 'Any' || right[Types.Kind] === 'Unknown')
      return result ? ExtendsResult.True : ExtendsResult.False
    } else if (right[Types.Kind] === 'Any') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Unknown') {
      return ExtendsResult.True
    } else {
      return ExtendsResult.False
    }
  }

  function Record<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object') {
      if (!RecordNumberOrStringKey(left as Types.TRecord)) {
        return Properties(PropertyMap(left), PropertyMap(right))
      } else {
        return globalThis.Object.keys(right.properties).length === 0 ? ExtendsResult.True : ExtendsResult.False
      }
    } else if (right[Types.Kind] === 'Record') {
      if (!RecordNumberOrStringKey(left as Types.TRecord) && !RecordNumberOrStringKey(right as Types.TRecord)) {
        return Properties(PropertyMap(left), PropertyMap(right))
      } else if (RecordNumberOrStringKey(left as Types.TRecord) && !RecordNumberOrStringKey(right as Types.TRecord)) {
        const leftKey = RecordKey(left as Types.TRecord)
        const rightKey = RecordKey(right as Types.TRecord)
        if (Extends(rightKey, leftKey) === ExtendsResult.False) {
          return ExtendsResult.False
        } else {
          return ExtendsResult.True
        }
      } else {
        return ExtendsResult.True
      }
    } else {
      return ExtendsResult.False
    }
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
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object' && ObjectRightRule(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'String') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRightRule(left, right)
    } else {
      return ExtendsResult.False
    }
  }

  function Tuple<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object') {
      if (ObjectRightRule(left, right) || globalThis.Object.keys(right.properties).length === 0) {
        return ExtendsResult.True
      } else {
        return ExtendsResult.False
      }
    } else if (right[Types.Kind] === 'Array') {
      if (right.items === undefined) {
        return ExtendsResult.False
      } else if (right.items[Types.Kind] === 'Union') {
        const result = left.items.every((left: Types.TSchema) => UnionRightRule(left, right.items) !== ExtendsResult.False)
        return result ? ExtendsResult.True : ExtendsResult.False
      } else if (right.items[Types.Kind] === 'Any') {
        return ExtendsResult.True
      } else {
        return ExtendsResult.False
      }
    } else {
      if (right[Types.Kind] !== 'Tuple') return ExtendsResult.False
      if (left.items === undefined && right.items === undefined) return ExtendsResult.True
      if (left.items === undefined && right.items !== undefined) return ExtendsResult.False
      if (left.items !== undefined && right.items === undefined) return ExtendsResult.False
      if (left.items === undefined && right.items === undefined) return ExtendsResult.True
      if (left.minItems !== right.minItems || left.maxItems !== right.maxItems) return ExtendsResult.False
      for (let i = 0; i < left.items!.length; i++) {
        if (Extends(left.items![i], right.items![i]) === ExtendsResult.False) return ExtendsResult.False
      }
      return ExtendsResult.True
    }
  }

  function Uint8Array<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Object' && ObjectRightRule(left, right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Uint8Array') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRightRule(left, right)
    } else {
      return ExtendsResult.False
    }
  }

  function Undefined<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (AnyOrUnknownRule(right)) {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Undefined') {
      return ExtendsResult.True
    } else if (right[Types.Kind] === 'Union') {
      return UnionRightRule(left, right)
    } else {
      return ExtendsResult.False
    }
  }

  function Union<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): ExtendsResult {
    if (left.anyOf.some((left: Types.TSchema) => left[Types.Kind] === 'Any')) {
      return ExtendsResult.Union
    } else if (right[Types.Kind] === 'Union') {
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
      case 'Promise':
        return Promise(left, resolvedRight)
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
