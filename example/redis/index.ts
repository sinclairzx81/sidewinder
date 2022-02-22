import { Type, RedisDatabase } from '@sidewinder/redis'

export const User = Type.Object({
    name: Type.String()
})

const Schema = Type.Database({
    lists: {
        users: User
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
    list.push({ name: '1' })

    
}

start()
