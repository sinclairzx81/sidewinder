import * as assert from 'assert'

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