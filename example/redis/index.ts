import { Type, RedisDatabase } from '@sidewinder/redis'

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
        users: Type.String(),
        items: Type.Number()
    }
})


async function start() {
    const database = await RedisDatabase.connect(Schema, 6379, '172.30.1.24', { })
    
    const map = database.map('users')
    map.set('A', { index: 1 })
    map.set('B', { index: 2 })
    map.set('C', { index: 3 })
    map.set('D', { index: 4 })
    map.delete('C')

    for await(const value of map.keys()) {
        console.log(value)
    }
    console.log(await map.size())
}

start()
