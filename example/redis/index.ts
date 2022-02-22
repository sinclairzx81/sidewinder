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
    
    const list = database.list('users')
    await list.clear()
    await list.unshift(0, 1, 2, 3)
    
    console.log('value', await list.index(99))
    for await(const value of list) {
        console.log(value)
    }


    
}

start()
