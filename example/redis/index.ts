import { Type, RedisDatabase, RedisReceiver, RedisSender } from '@sidewinder/redis'
import { Delay } from '@sidewinder/async'
export const Vector = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number()
})

const Schema = Type.Database({
    arrays: {
        vectors: Vector
    },
    maps: {
        vectors: Vector,
    },
    sets: {
        vectors: Vector
    }
})

async function database() {
    const database = await RedisDatabase.connect(Schema, 'redis://172.30.1.24:6379')
    const map = database.map('vectors')
    map.set('A', { x: 1, y: 2, z: 3 })
    map.set('B', { x: 1, y: 2, z: 3 })
    map.set('C', { x: 1, y: 2, z: 3 })
    const result = await map.collect()
    console.log(result)
    const array = database.array('vectors')
    array.push({ x: 1, y: 2, z: 3 })
    console.log(await array.length())
    console.log(await array.get(3))
    const set = database.set('vectors')
    set.collect()
    await set.clear()
    await set.add({ x: 1, y: 2, z: 1 })
    await set.add({ x: 1, y: 2, z: 2 })
    await set.add({ x: 1, y: 2, z: 3 })
    console.log(await set.has({ x: 1, y: 2, z: 3 }))
    for await (const value of set) {
        console.log(value)
    }
}

async function start() {
    const Message = Type.Object({
        x: Type.Number(),
        y: Type.Number(),
        z: Type.Number()
    })
    const receiver = await RedisReceiver.connect('numbers', Message, 'redis://172.30.1.24:6379')
    const sender = await RedisSender.connect('numbers', Message, 'redis://172.30.1.24:6379')

    setInterval(async () => {
        for (let i = 0; i < 128; i++) {
            await sender.send({x: 1, y: 2, z: i})
        }
    }, 500)

    console.log('ended sender')
    await Delay.wait(2000)
    console.log('reading sender')
    for await (const value of receiver) {
        console.log(value)
    }
    console.log('done1')
}

start()
