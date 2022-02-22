import { Type, RedisDatabase, RedisReceiver, RedisSender, RedisPub, RedisSub } from '@sidewinder/redis'

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
    const pub = await RedisPub.connect(Vector, 'updates', 'redis://172.30.1.24:6379')
    const sub1 = await RedisSub.connect(Vector, 'updates', 'redis://172.30.1.24:6379')
    const sub2 = await RedisSub.connect(Vector, 'updates', 'redis://172.30.1.24:6379')
        ; (async () => {
            for await (const value of sub1) {
                console.log(value)
            }
            console.log('ended iter')
        })()
        ; (async () => {
            for await (const value of sub2) {
                console.log(value)
            }
            console.log('ended iter')
        })()
    const x = setInterval(() => {
        pub.send({ x: 1, y: 2, z: 3 })
    }, 100)

    setTimeout(() => {
        clearInterval(x)
        console.log('DISPOSING')
        sub1.dispose()
        sub2.dispose()
        pub.dispose()
        database.dispose()
    }, 5000)







}

database()