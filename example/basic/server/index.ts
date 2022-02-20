import { Delay } from '@sidewinder/async'
import { Channel } from '@sidewinder/channel'


const channel = new Channel()

async function receive() {
    for await(const value of channel) {
        console.log(value)
    }
}

receive()

