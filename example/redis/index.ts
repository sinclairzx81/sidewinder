import * as Redis from '@sidewinder/redis'

const T = Redis.Type.Object({
  x: Redis.Type.Number(),
})

async function memoryTest() {
  const sender = new Redis.MemorySender(T, 'topic')
  sender.send({ x: 123 })
  sender.send({ x: 123 })
  sender.send({ x: 123 })
  sender.send({ x: 123 })
  sender.send({ x: 123 })
  const reciever1 = new Redis.MemoryReceiver(T, 'topic')
  const reciever2 = new Redis.MemoryReceiver(T, 'topic')
  setInterval(async () => sender.send({ x: Date.now() }), 100)
  async function read1() {
    for await (const value of reciever1) {
      console.log(1, value)
    }
  }
  async function read2() {
    for await (const value of reciever2) {
      console.log(2, value)
    }
  }
  read1()
  read2()
}

memoryTest()

async function redisTest() {
  const sender = await Redis.RedisSender.connect(T, 'topic', 'redis://172.30.1.1:6379')
  const reciever1 = await Redis.RedisReceiver.connect(T, 'topic', 'redis://172.30.1.1:6379')
  const reciever2 = await Redis.RedisReceiver.connect(T, 'topic', 'redis://172.30.1.1:6379')
  setInterval(async () => sender.send({ x: Date.now() }), 100)
  async function read1() {
    for await (const value of reciever1) {
      console.log(1, value)
    }
  }
  async function read2() {
    for await (const value of reciever2) {
      console.log(2, value)
    }
  }
  read1()
  read2()
}
