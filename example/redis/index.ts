import { Type, RedisDatabase, RedisReceiver } from '@sidewinder/redis'

export const User = Type.Object({
    index: Type.Number()
})

const Schema = Type.Database({
    lists: {
        users: Type.Number()
    },
    maps: {
        users: User,
    },
    sets: {
        strings: Type.String(),
        numbers: Type.Number()
    }
})


async function start() {
    const database = await RedisDatabase.connect(Schema, 6379, '172.30.1.24', { })
    
    const map = database.map('users')
    
    for await(const value of map.keys()) {
        console.log(value)
    }
    console.log(await map.size())
}

start()
