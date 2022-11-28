import * as Redis from '@sidewinder/redis'

const endpoint = 'redis://172.30.1.1:6379'

const T = Redis.Type.Object({
  x: Redis.Type.Number(),
})

async function test() {
  const sender = await Redis.PubSubRedisSender.Create(T, 'topic', endpoint)
  sender.send({ x: 1 })
  sender.send({ x: 2 })
  sender.send({ x: 3 })
  const reciever1 = await Redis.PubSubRedisReceiver.Create(T, 'topic', endpoint)
  const reciever2 = await Redis.PubSubRedisReceiver.Create(T, 'topic', endpoint)
  reciever1.close()
  setInterval(async () => sender.send({ x: Date.now() }), 1111)
  async function receive1() {
    for await (const value of reciever1) {
      console.log(1, value)
    }
  }
  async function receive2() {
    for await (const value of reciever2) {
      console.log(2, value)
    }
  }
  receive1()
  receive2()
}

test()
