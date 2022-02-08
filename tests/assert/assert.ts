import * as assert from 'assert'
import * as uuid from 'uuid'

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