/*--------------------------------------------------------------------------

@sidewinder/value

The MIT License (MIT)

Copyright (c) 2022-2024 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { ValueClone } from './clone'
import { ValueCheck } from './check'
import { Deref } from './deref'
import { Kind, TSchema, TArray, TBoolean, TDate, TInteger, TLiteral, TNull, TNumber, TObject, TRecord, TRef, TTuple, TUnion, TString, TUndefined } from '@sidewinder/type'

// ------------------------------------------------------------------
// ValueGuard
// ------------------------------------------------------------------
import { ValueGuard } from './guard'

export namespace ValueConvert {
  // ------------------------------------------------------------------
  // Conversions
  // ------------------------------------------------------------------
  function IsStringNumeric(value: unknown): value is string {
    return ValueGuard.IsString(value) && !isNaN(value as any) && !isNaN(parseFloat(value))
  }
  function IsValueToString(value: unknown): value is { toString: () => string } {
    return ValueGuard.IsBigInt(value) || ValueGuard.IsBoolean(value) || ValueGuard.IsNumber(value)
  }
  function IsValueTrue(value: unknown): value is true {
    return value === true || (ValueGuard.IsNumber(value) && value === 1) || (ValueGuard.IsBigInt(value) && value === BigInt('1')) || (ValueGuard.IsString(value) && (value.toLowerCase() === 'true' || value === '1'))
  }
  function IsValueFalse(value: unknown): value is false {
    return (
      value === false ||
      (ValueGuard.IsNumber(value) && (value === 0 || Object.is(value, -0))) ||
      (ValueGuard.IsBigInt(value) && value === BigInt('0')) ||
      (ValueGuard.IsString(value) && (value.toLowerCase() === 'false' || value === '0' || value === '-0'))
    )
  }
  function IsTimeStringWithTimeZone(value: unknown): value is string {
    return ValueGuard.IsString(value) && /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i.test(value)
  }
  function IsTimeStringWithoutTimeZone(value: unknown): value is string {
    return ValueGuard.IsString(value) && /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)?$/i.test(value)
  }
  function IsDateTimeStringWithTimeZone(value: unknown): value is string {
    return ValueGuard.IsString(value) && /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i.test(value)
  }
  function IsDateTimeStringWithoutTimeZone(value: unknown): value is string {
    return ValueGuard.IsString(value) && /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)?$/i.test(value)
  }
  function IsDateString(value: unknown): value is string {
    return ValueGuard.IsString(value) && /^\d\d\d\d-[0-1]\d-[0-3]\d$/i.test(value)
  }
  // ------------------------------------------------------------------
  // Convert
  // ------------------------------------------------------------------
  function TryConvertLiteralString(value: unknown, target: string) {
    const conversion = TryConvertString(value)
    return conversion === target ? conversion : value
  }
  function TryConvertLiteralNumber(value: unknown, target: number) {
    const conversion = TryConvertNumber(value)
    return conversion === target ? conversion : value
  }
  function TryConvertLiteralBoolean(value: unknown, target: boolean) {
    const conversion = TryConvertBoolean(value)
    return conversion === target ? conversion : value
  }
  // prettier-ignore
  function TryConvertLiteral(schema: TLiteral, value: unknown) {
    return (
      ValueGuard.IsString(schema.const) ? TryConvertLiteralString(value, schema.const) :
        ValueGuard.IsNumber(schema.const) ? TryConvertLiteralNumber(value, schema.const) :
          ValueGuard.IsBoolean(schema.const) ? TryConvertLiteralBoolean(value, schema.const) :
            ValueClone.Clone(value)
    )
  }
  function TryConvertBoolean(value: unknown) {
    return IsValueTrue(value) ? true : IsValueFalse(value) ? false : value
  }
  function TryConvertString(value: unknown) {
    return IsValueToString(value) ? value.toString() : ValueGuard.IsSymbol(value) && value.description !== undefined ? value.description.toString() : value
  }
  function TryConvertNumber(value: unknown) {
    return IsStringNumeric(value) ? parseFloat(value) : IsValueTrue(value) ? 1 : IsValueFalse(value) ? 0 : value
  }
  function TryConvertInteger(value: unknown) {
    return IsStringNumeric(value) ? parseInt(value) : ValueGuard.IsNumber(value) ? value | 0 : IsValueTrue(value) ? 1 : IsValueFalse(value) ? 0 : value
  }
  function TryConvertNull(value: unknown) {
    return ValueGuard.IsString(value) && value.toLowerCase() === 'null' ? null : value
  }
  function TryConvertUndefined(value: unknown) {
    return ValueGuard.IsString(value) && value === 'undefined' ? undefined : value
  }
  // ------------------------------------------------------------------
  // note: this function may return an invalid dates for the regex
  // tests above. Invalid dates will however be checked during the
  // casting function and will return a epoch date if invalid.
  // Consider better string parsing for the iso dates in future
  // revisions.
  // ------------------------------------------------------------------
  // prettier-ignore
  function TryConvertDate(value: unknown) {
    return (
      ValueGuard.IsDate(value) ? value :
      ValueGuard.IsNumber(value) ? new Date(value) :
      IsValueTrue(value) ? new Date(1) :
      IsValueFalse(value) ? new Date(0) :
      IsStringNumeric(value) ? new Date(parseInt(value)) :
      IsTimeStringWithoutTimeZone(value) ? new Date(`1970-01-01T${value}.000Z`) :
      IsTimeStringWithTimeZone(value) ? new Date(`1970-01-01T${value}`) :
      IsDateTimeStringWithoutTimeZone(value) ? new Date(`${value}.000Z`) :
      IsDateTimeStringWithTimeZone(value) ? new Date(value) :
      IsDateString(value) ? new Date(`${value}T00:00:00.000Z`) :
      value
    )
  }
  // ------------------------------------------------------------------
  // Default
  // ------------------------------------------------------------------
  function Default(value: any) {
    return value
  }
  // ------------------------------------------------------------------
  // Convert
  // ------------------------------------------------------------------
  function FromArray(schema: TArray, references: TSchema[], value: any): any {
    const elements = ValueGuard.IsArray(value) ? value : [value]
    return elements.map((element) => Visit(schema.items, references, element))
  }
  function FromBoolean(schema: TBoolean, references: TSchema[], value: any): unknown {
    return TryConvertBoolean(value)
  }
  function FromDate(schema: TDate, references: TSchema[], value: any): unknown {
    return TryConvertDate(value)
  }
  function FromInteger(schema: TInteger, references: TSchema[], value: any): unknown {
    return TryConvertInteger(value)
  }
  function FromLiteral(schema: TLiteral, references: TSchema[], value: any): unknown {
    return TryConvertLiteral(schema, value)
  }
  function FromNull(schema: TNull, references: TSchema[], value: any): unknown {
    return TryConvertNull(value)
  }
  function FromNumber(schema: TNumber, references: TSchema[], value: any): unknown {
    return TryConvertNumber(value)
  }
  // prettier-ignore
  function FromObject(schema: TObject, references: TSchema[], value: any): unknown {
    const isConvertable = ValueGuard.IsObject(value)
    if (!isConvertable) return value
    const result: Record<PropertyKey, unknown> = {}
    for (const key of Object.keys(value)) {
      result[key] = ValueGuard.HasPropertyKey(schema.properties, key)
        ? Visit(schema.properties[key], references, value[key])
        : value[key]
    }
    return result
  }
  function FromRecord(schema: TRecord, references: TSchema[], value: any): unknown {
    const propertyKey = Object.getOwnPropertyNames(schema.patternProperties)[0]
    const property = schema.patternProperties[propertyKey]
    const result = {} as Record<string, unknown>
    for (const [propKey, propValue] of Object.entries(value)) {
      result[propKey] = Visit(property, references, propValue)
    }
    return result
  }
  function FromRef(schema: TRef, references: TSchema[], value: any): unknown {
    return Visit(Deref(schema, references), references, value)
  }
  function FromString(schema: TString, references: TSchema[], value: any): unknown {
    return TryConvertString(value)
  }
  // prettier-ignore
  function FromTuple(schema: TTuple, references: TSchema[], value: any): unknown {
    const isConvertable = ValueGuard.IsArray(value) && !ValueGuard.IsUndefined(schema.items)
    if (!isConvertable) return value
    return value.map((value, index) => {
      return (index < schema.items!.length)
        ? Visit(schema.items![index], references, value)
        : value
    })
  }
  function FromUndefined(schema: TUndefined, references: TSchema[], value: any): unknown {
    return TryConvertUndefined(value)
  }
  function FromUnion(schema: TUnion, references: TSchema[], value: any): unknown {
    for (const subschema of schema.anyOf) {
      const converted = Visit(subschema, references, value)
      if (!ValueCheck.Check(subschema, references, converted)) continue
      return converted
    }
    return value
  }
  function Visit(schema: TSchema, references: TSchema[], value: any): unknown {
    const references_ = ValueGuard.IsString(schema.$id) ? [...references, schema] : references
    const schema_ = schema as any
    switch (schema[Kind]) {
      case 'Array':
        return FromArray(schema_, references_, value)
      case 'Boolean':
        return FromBoolean(schema_, references_, value)
      case 'Date':
        return FromDate(schema_, references_, value)
      case 'Integer':
        return FromInteger(schema_, references_, value)
      case 'Literal':
        return FromLiteral(schema_, references_, value)
      case 'Null':
        return FromNull(schema_, references_, value)
      case 'Number':
        return FromNumber(schema_, references_, value)
      case 'Object':
        return FromObject(schema_, references_, value)
      case 'Record':
        return FromRecord(schema_, references_, value)
      case 'Ref':
        return FromRef(schema_, references_, value)
      case 'String':
        return FromString(schema_, references_, value)
      case 'Tuple':
        return FromTuple(schema_, references_, value)
      case 'Undefined':
        return FromUndefined(schema_, references_, value)
      case 'Union':
        return FromUnion(schema_, references_, value)
      default:
        return Default(value)
    }
  }
  // ------------------------------------------------------------------
  // Convert
  // ------------------------------------------------------------------
  /** Converts any type mismatched values to their target type if a reasonable conversion is possible. */
  export function Convert(schema: TSchema, references: TSchema[], value: unknown): unknown
  /** Converts any type mismatched values to their target type if a reasonable conversion is possible. */
  export function Convert(schema: TSchema, value: unknown): unknown
  /** Converts any type mismatched values to their target type if a reasonable conversion is possible. */
  // prettier-ignore
  export function Convert(...args: any[]) {
    return args.length === 3
      ? Visit(args[0], args[1], args[2])
      : Visit(args[0], [], args[1])
  }
}
