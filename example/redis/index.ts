import { Type, RedisDatabase } from '@sidewinder/redis'

const Schema = Type.Database({
    maps: {
        users: 1
    },
    sets: {},
    lists: {}
})

async function start() {
    const database = await RedisDatabase.connect(Schema)
    const set = database.set('context')
    
    
}

start()
