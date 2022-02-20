import { Delay } from '@sidewinder/async'
import { Channel, Select, SyncChannel, SyncSender, Receiver } from '@sidewinder/channel'

const channel0 = new SyncChannel<number>(1, true)
const channel1 = new SyncChannel<boolean>(1, true)
const channel2 = new SyncChannel<string>(1, true)

async function numbers() {
    for(let i = 0; i < 20; i++) {
        await channel0.send(i)
        console.log('sent:number')
    }
    await channel0.end()
}
async function booleans() {
    for(let i = 0; i < 20; i++) {
        await channel1.send(true)
        console.log('sent:boolean')
    }
    await channel1.end()
}
async function strings() {
    for(let i = 0; i < 20; i++) {
        await channel2.send('hello world')
        console.log('sent:string')
    }
    await channel2.end()
}
async function receiver() {
    for await(const value of Select([channel0, channel1, channel2])) {
        console.log('        recv', value)
        await Delay.wait(1000)
    }
}

strings()
numbers()
booleans()


receiver().then(() => console.log('receiver:done'))


