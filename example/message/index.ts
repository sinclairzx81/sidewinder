import * as Redis from '@sidewinder/redis'

const endpoint = 'redis://172.30.1.1:6379'
const channel = 'system-bus'
const T = Redis.Type.Object({
  x: Redis.Type.Number(),
})

async function test() {
  const sender = await Redis.RedisSender.Create(T, channel, endpoint)
  sender.send({ x: 1 })
  sender.send({ x: 2 })
  sender.send({ x: 3 })
  const reciever1 = await Redis.RedisReceiver.Create(Redis.Type.Boolean(), channel, endpoint)
  const reciever2 = await Redis.RedisReceiver.Create(T, channel, endpoint)
  setInterval(async () => sender.send({ x: Date.now() }), 1000)
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
