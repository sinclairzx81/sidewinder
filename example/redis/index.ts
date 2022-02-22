import { Type, RedisDatabase, RedisMap } from '@sidewinder/redis'

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

export class Test {
    private readonly vectors: RedisMap<typeof Vector>

    constructor(private readonly database: RedisDatabase<typeof Schema>) {
        this.vectors = this.database.map('vectors')
    }
    public async test() {
        await this.vectors.set('name', { x: 1, y: 2, z: 3 })
        await this.vectors.has('')
    }
}

async function start() {
    const database = await RedisDatabase.connect(Schema, 'redis://172.30.1.24:6379')
    const map = database.map('vectors')
    map.set('A', { x: 1, y: 2, z: 3})
    map.set('B', { x: 1, y: 2, z: 3})
    map.set('C', { x: 1, y: 2, z: 3})
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

    for await(const value of set) {
        console.log(value)
    }
}

start()
