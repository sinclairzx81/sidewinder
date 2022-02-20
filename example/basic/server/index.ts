import { Delay } from '@sidewinder/async'
import { SyncChannel, Channel, SyncSender, Receiver } from '@sidewinder/channel'

const channel = new SyncChannel(6)

let index = 0
async function sender(sender: SyncSender<any>) {
    for(let i = 0; i < 20; i++) {
        const next = index++
        await sender.send(next)
        console.log('sent', next)
    }
    await sender.end()
}

async function receiver(receiver: Receiver<any>) {
    for await(const value of receiver) {
        console.log('        recv', value)
        
    }
}




sender(channel).then(() => console.log('sender:done'))
receiver(channel).then(() => console.log('receiver:done'))


