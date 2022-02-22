import { Type, Static, RedisDatabase, RedisMap } from '@sidewinder/redis'

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

export class Test {
    private readonly users: RedisMap<Static<typeof User>>

    constructor(private readonly database: RedisDatabase<typeof Schema>) {
        this.users = this.database.map('users')
    }
    public async test() {
        await this.users.set('name', { index: 0 })
    }
}

async function start() {
    const database = await RedisDatabase.connect(Schema, 'redis://172.30.1.24:6379')

    const map = database.map('users')

    for await(const value of map.keys()) {
        console.log(value)
    }

    console.log(await map.size())
}

start()
