import { Type, Static, Store, RedisDatabase, MemoryStore, RedisStore } from '@sidewinder/redis'
import { Value } from '@sidewinder/value'

export type Token = Static<typeof Token>
export const Token = Type.Object({
  value: Type.String(),
})

export const TokenDatabaseSchema = Type.Database({
  arrays: {
    test: Type.String(),
  },
  maps: {
    token: Token,
  },
  sets: {
    token: Type.Tuple([Type.Number(), Type.Number(), Type.Number()]),
  },
})

export class TokenDatabase extends RedisDatabase<typeof TokenDatabaseSchema> {
  constructor(store: Store) {
    super(TokenDatabaseSchema, store)
  }
  public async setToken(token: Token): Promise<string> {
    const key = Value.Hash(token).toString(16)
    await this.map('token').set(key, token)
    return key
  }

  public async getToken(key: string): Promise<Token | undefined> {
    const exists = await this.map('token').has(key)
    if (!exists) return undefined
    return await this.map('token').get(key)
  }

  public async deleteToken(key: string): Promise<void> {
    return await this.map('token').delete(key)
  }
}

async function createRedisStore() {
  // return await RedisStore.Create('redis://172.30.1.1:6379')
  return MemoryStore.Create()
}

async function test() {
  const tokens = new TokenDatabase(await createRedisStore())
  tokens.map('token').set('A', { value: 'A' })
  tokens.map('token').set('B', { value: 'B' })
  tokens.map('token').set('C', { value: 'C' })
  tokens.map('token').expire('A', 2)
  tokens.map('token').expire('B', 4)
  tokens.map('token').expire('C', 6)
  setInterval(async () => {
    console.log(await tokens.map('token').values())
  }, 100)
  // const key = await tokens.setToken({ value: 'hello' })
  // console.log(await tokens.getToken(key))
  // console.log(await tokens.deleteToken(key))
  // console.log(await tokens.getToken(key))
  // await tokens.array('test').clear()
  // await tokens.array('test').push('A')
  // await tokens.array('test').push('B')
  // await tokens.array('test').push('C')
  // await tokens.array('test').push('D')
  // await tokens.array('test').push('E')
  // await tokens.array('test').push('F')
  // await tokens.array('test').push('G')
  // await tokens.array('test').push('H')

  // console.log(await tokens.map('token').keys())

  // console.log(await tokens.array('test').slice(1, 1 + 4))
  // console.log(await tokens.array('test').length())
  // console.log([...(await tokens.array('test').values())])
}

test()
