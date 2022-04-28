import * as Types from '@sidewinder/type'
import { Type } from '@sidewinder/type'

export namespace Extends {

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
        return false
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
        } else if(right[Types.Kind] === 'String') {
            return typeof left.const === 'string'  
        } else if(right[Types.Kind] === 'Number') {
            return typeof left.const === 'number'  
        } else if(right[Types.Kind] === 'Boolean') {
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
        return false
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
                    if (Extends(innerLeft, innerRight)) return true
                }
            }
        } else {
            for (const innerLeft of left.anyOf) {
                if (Extends(innerLeft, right)) return true
            }
        }
        return false
    }

    export function Extends<Left extends Types.TAnySchema, Right extends Types.TAnySchema>(left: Left, right: Right): boolean {
        switch (left[Types.Kind]) {
            case 'Any': return Any(left, right)
            case 'Array': return Array(left, right)
            case 'Boolean': return Boolean(left, right)
            case 'Constructor': return Constructor(left, right)
            case 'Enum': return Enum(left, right)
            case 'Function': return Function(left, right)
            case 'Integer': return Integer(left, right)
            case 'Literal': return Literal(left, right)
            case 'Null': return Null(left, right)
            case 'Number': return Number(left, right)
            case 'Object': return Object(left, right)
            case 'Record': return Record(left, right)
            case 'Ref': return Ref(left, right)
            case 'String': return String(left, right)
            case 'Tuple': return Tuple(left, right)
            case 'Undefined': return Undefined(left, right)
            case 'Uint8Array': return Uint8Array(left, right)
            case 'Union': return Union(left, right)
            case 'Unknown': return Unknown(left, right)
            default: return false
        }
    }
}

const T = Type.String()

type T = 'hello' extends string ? true : false

const B = Type.Literal('hello')
const A = Type.String()

const R = Extends.Extends(A, B)

console.log(R)