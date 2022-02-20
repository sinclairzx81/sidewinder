import { Queue } from '@sidewinder/channel'
import * as assert from '../assert/index'

describe('channel/Queue', () => {
    it('should enqueue value', () => {
        const queue = new Queue()
        queue.enqueue(0)
    })

    it('should dequeue value', async () => {
        const queue = new Queue()
        queue.enqueue(0)
        const value = await queue.dequeue()
        assert.equal(value, 0)
    })

    it('should dequeue many values', async () => {
        const queue = new Queue()
        queue.enqueue(0)
        queue.enqueue(1)
        queue.enqueue(2)
        queue.enqueue(3)
        const value0 = await queue.dequeue()
        const value1 = await queue.dequeue()
        const value2 = await queue.dequeue()
        const value3 = await queue.dequeue()  
        assert.deepEqual([value0, value1, value2, value3], [0, 1, 2, 3])
    })

    it('should dequeue value on next tick', async () => {
        const queue = new Queue()
        setTimeout(() => queue.enqueue(0))
        const value = await queue.dequeue()
        assert.equal(value, 0)
    })

    it('should dequeue many values on next tick', async () => {
        const queue = new Queue()
        setTimeout(() => {
            queue.enqueue(0)
            queue.enqueue(1)
            queue.enqueue(2)
            queue.enqueue(3)
        })
        const value0 = await queue.dequeue()
        const value1 = await queue.dequeue()
        const value2 = await queue.dequeue()
        const value3 = await queue.dequeue()  
        assert.deepEqual([value0, value1, value2, value3], [0, 1, 2, 3])
    })

    it('should report accurate bufferAmount', () => {
        const queue = new Queue()
        queue.enqueue(0)
        queue.enqueue(1)
        queue.enqueue(2)
        queue.enqueue(3)
        assert.equal(queue.bufferedAmount, 4)
    })

    it('should report accurate bufferAmount on dequeue', async () => {
        const queue = new Queue()
        queue.enqueue(0)
        queue.enqueue(1)
        queue.enqueue(2)
        queue.enqueue(3)
        assert.equal(queue.bufferedAmount, 4)
        await queue.dequeue()
        assert.equal(queue.bufferedAmount, 3)
        await queue.dequeue()
        assert.equal(queue.bufferedAmount, 2)
        await queue.dequeue()
        assert.equal(queue.bufferedAmount, 1)
        await queue.dequeue()
        assert.equal(queue.bufferedAmount, 0)
    })
})