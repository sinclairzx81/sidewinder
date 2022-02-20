/*--------------------------------------------------------------------------

@sidewinder/async

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

interface SemaphoreAwaiter<T = any> {
    executor(): Promise<T> | T
    resolve (value: T): void
    reject  (error: Error): void
}

export class Semaphore {
    private readonly awaiters: Array<SemaphoreAwaiter>
    private running: number

    constructor(
        private readonly concurrency: number = 1, 
        private readonly throttle:    number = 0
    ) {
        this.awaiters = []
        this.running = 0
    }
    
    public run<T = any>(executor: () => Promise<T> | T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.awaiters.push({ executor, resolve, reject })
            this.dispatch()
        })
    }
    
    private increment() {
        this.running += 1
    }
    
    private decrement() {
        this.running -= 1
    }

    private resume() {
        setTimeout(() => {
            this.decrement()
            this.dispatch()
        }, this.throttle)
    }
    
    private async dispatch(): Promise<any> {
        if (this.awaiters.length === 0 || this.running >= this.concurrency) {
            return
        }
        const awaiter = this.awaiters.shift()!
        this.increment()
        try {
            awaiter.resolve(await awaiter.executor())
        } catch (error) {
            awaiter.reject(error as any)
        }
        this.resume()
    }
}