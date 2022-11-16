import { RedisSub, RedisPub, MemoryPub, MemorySub, Pub, Sub } from '@sidewinder/redis'
import { SystemEvent } from './event'

async function send(pub: Pub<SystemEvent>) {
    setInterval(() => pub.send({ type: 'Hello' }), 1)
}

async function receive(sub: Sub<SystemEvent>) {
    for await (const value of sub) {
        console.log(value)
    }
    console.log('done')
}

async function redisPub() {
    const sender = await RedisPub.connect(SystemEvent, 'SystemEvent', 'redis://172.30.1.1:6379')
    send(sender)
}

async function redisSub() {
    const receiver = await RedisSub.connect(SystemEvent,  'SystemEvent', 'redis://172.30.1.1:6379')
    receive(receiver)
}

async function memoryPub() {
    const sender = new MemoryPub(SystemEvent, 'SystemEvent')
    send(sender)
}

async function memorySub() {
    const receiver = new MemorySub(SystemEvent, 'SystemEvent')
    receive(receiver)
}

memoryPub()
memorySub()
redisPub()
redisSub()
redisSub()
redisSub()