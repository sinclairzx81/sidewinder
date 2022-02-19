import { Delay } from '@sidewinder/async'
import { SyncChannel } from '@sidewinder/channel'

const channel = new SyncChannel(10)

let index = 0
async function sender() {
    for(let i = 0; i < 23; i++) {
        const next = index++
        await channel.send(next)
        console.log('sent', next)
    }
    // await channel.error(new Error('Oh Shit'))
    // await channel.end()
    console.log('done')
    // await Delay.run(4000)
    // for(let i = 0; i < 100; i++) {
    //     const next = index++
    //     await channel.send(next)
    //     console.log('sent', next)
    // }
}

async function receiver() {
    for await(const value of channel) {
        await Delay.run(100)
        console.log('        recv', value, channel.buffered)
    }
    console.log('DONE')
}

sender()
receiver()


