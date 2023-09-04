import { RedisStore, RedisDatabase, MemoryStore, Type } from '@sidewinder/redis'

export const Vector = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  z: Type.Number(),
})

async function instance() {
  // const store = await RedisStore.Create(6379)
  // const store = MemoryStore.Singleton()
  const store = MemoryStore.Create()
  return new RedisDatabase(
    Type.Database({
      maps: {
        vectors: Vector,
      },
    }),
    store,
  )
}

async function start() {
  // create instance 1
  const instance1 = await instance()
  const map1 = instance1.map('vectors')
  map1.set('key', { x: 1, y: 1, z: 2 })

  // create instance 2 (flushall() in constructor)
  const instance2 = await instance()
  const map2 = instance2.map('vectors')

  // expect instance 1 to have key
  const exists = await map1.has('key')
  console.assert(exists, true)
}

start()
