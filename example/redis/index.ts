import { RedisStore, RedisDatabase, Type } from '@sidewinder/redis'

export const Vector = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  z: Type.Number(),
})

async function start() {
  const database = new RedisDatabase(
    Type.Database({
      arrays: {
        vectors: Vector,
      },
    }),
    await RedisStore.Create(6379),
  )
  const array = database.array('vectors')
  await array.push({ x: Math.random(), y: Math.random(), z: Math.random() })
  await array.push({ x: Math.random(), y: Math.random(), z: Math.random() })
  await array.push({ x: Math.random(), y: Math.random(), z: Math.random() })
  console.log(await array.values())
}

start()
