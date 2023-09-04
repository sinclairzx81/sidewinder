import { Assert } from '../../assert/index'
import { MemoryStore } from '@sidewinder/redis'

describe('redis/MemoryStore', () => {
  // ---------------------------------------------------
  // Instances
  // ---------------------------------------------------
  it('Should return singleton instance', async () => {
    const instance1 = MemoryStore.Singleton()
    const instance2 = MemoryStore.Singleton()
    Assert.isTrue(instance1 === instance2)
  })
  it('Should create transient instance', async () => {
    const instance1 = MemoryStore.Create()
    const instance2 = MemoryStore.Create()
    Assert.isFalse(instance1 === instance2)
    instance1.disconnect()
    instance1.disconnect()
  })
  it('Should not overwrite data on subsequent instances', async () => {
    const instance1 = MemoryStore.Create()
    instance1.set('key', 'value')

    const instance2 = MemoryStore.Create()
    Assert.isTrue(1 === (await instance1.exists('key')))
    instance1.disconnect()
    instance2.disconnect()
  })
  it('Should throw when access on closed store', async () => {
    const instance = MemoryStore.Create()
    instance.disconnect()
    Assert.throwsAsync(() => instance.set('key', 'value'))
  })
  // ---------------------------------------------------
  // SetOptions
  // ---------------------------------------------------
  it('Should update using conditionalSet "exists"', async () => {
    const instance = MemoryStore.Create()
    await instance.set('key', 'hello', { conditionalSet: 'exists' })
    const value = await instance.get('key')
    Assert.isTrue(value === null)
  })
  it('Should update using conditionalSet "not-exists"', async () => {
    const instance = MemoryStore.Create()
    await instance.set('key', 'value1')
    await instance.set('key', 'value2', { conditionalSet: 'not-exists' })
    const value = await instance.get('key')
    Assert.isTrue(value === 'value1')
  })
  // ---------------------------------------------------
  // SortedSetOptions
  // ---------------------------------------------------

  // todo
})
