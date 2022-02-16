import * as assert from 'assert'
import * as uuid from 'uuid'

let port = 9000
/** Generates a new port used for host binding */
export function nextPort() {
    const next = port++
    return next
}

/** Creates a delay for out of band read/write tests */
export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/** Creates a random string value for read/write assertion tests */
export function random(): string {
    return uuid.v4()
}

export function equal(actual: unknown, expect: unknown) {
    return assert.equal(actual, expect)
}

export function notEqual(actual: unknown, expect: unknown) {
    return assert.notEqual(actual, expect)
}

export function deepEqual(actual: unknown, expect: unknown) {
    return assert.deepEqual(actual, expect)
}

export function throws(callback: Function) {
    try { callback() } catch { return }
    throw Error('Expected throw')
}

export async function throwsAsync(callback: Function) {
    try { await callback() } catch { return }
    throw Error('Expected throw')
}

export function isTypeOf(value: any, type: any) {
    if(typeof value === type) return
    throw Error(`Value is not typeof ${type}`)
}

export function isInstanceOf(value: any, constructor: any) {
    if(value instanceof constructor) return
    throw Error(`Value is not instance of ${constructor}`)
}