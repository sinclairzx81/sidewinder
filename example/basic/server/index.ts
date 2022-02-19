import { Delay } from '@sidewinder/async'
import { SyncChannel, Channel } from '@sidewinder/channel'

const channel = new SyncChannel()

let index = 0
async function sender() {
    for(let i = 0; i < 20; i++) {
        const next = index++
        channel.send(next)
        console.log('sent', next)
    }
    channel.end()


}

async function receiver() {
    for await(const value of channel) {
        console.log('        recv', value)
        await Delay.wait(1000)
    }
}

sender().then(() => console.log('sender:done'))
receiver().then(() => console.log('receiver:done'))


