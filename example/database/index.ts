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
  return await RedisStore.Create('redis://172.30.1.1:6379')
  return MemoryStore.Create()
}

async function test() {
  const tokens = new TokenDatabase(await createRedisStore())
  const key = await tokens.setToken({ value: 'hello' })
  console.log(await tokens.getToken(key))
  console.log(await tokens.deleteToken(key))
  console.log(await tokens.getToken(key))
  await tokens.array('test').clear()
  await tokens.array('test').push('hello')
  await tokens.array('test').push('world')
  // await tokens.array('test').clear()
  console.log(await tokens.array('test').length())
  console.log([...(await tokens.array('test').collect())])
}

test()
