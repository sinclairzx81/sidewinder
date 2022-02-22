import { Type, Static, RedisDatabase, RedisMap } from '@sidewinder/redis'

export const User = Type.Object({
    index: Type.Number()
})

const Schema = Type.Database({
    arrays: {
        users: Type.Number()
    },
    maps: {
        users: User,
    },
    sets: {
        vectors: Type.Tuple([Type.Number(), Type.Number()])
    }
})

export class Test {
    private readonly users: RedisMap<typeof User>

    constructor(private readonly database: RedisDatabase<typeof Schema>) {
        this.users = this.database.map('users')
    }
    public async test() {
        await this.users.set('name', { index: 0 })
        await this.users.has('')
    }
}

async function start() {
    const database = await RedisDatabase.connect(Schema, 'redis://172.30.1.24:6379')
    database.array('users')
    const vectors = database.set('vectors')
    await vectors.add([1, 2])
    await vectors.add([1, 3])
    await vectors.add([1, 4])
    console.log(await vectors.has([1, 2]))

    for await(const value of vectors) {
        console.log(value)
    }
}

start()
