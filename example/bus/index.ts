import { Type, MemorySender, MemoryReceiver} from '@sidewinder/redis'

const sender = new MemorySender(Type.String(), 'hello')
const reciever = new MemoryReceiver(Type.String(), 'hello')

setInterval(async () => {
    sender.send('hello' + Date.now())
}, 100)

async function test() {
    for await (const value of reciever) {
        console.log(value)
    }
}

test()