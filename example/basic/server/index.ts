import { Delay } from '@sidewinder/async'
import { SyncChannel } from '@sidewinder/channel'

const channel = new SyncChannel(12)

let index = 0
async function sender() {
    for(let i = 0; i < 20; i++) {
        const next = index++
        await channel.send(next)
        console.log('sent', next)
    }
    await channel.end()


}

async function receiver() {
    for await(const value of channel) {
        console.log('        recv', value)
        await Delay.wait(1000)
    }
}

sender().then(() => console.log('sender:done'))
receiver().then(() => console.log('receiver:done'))


