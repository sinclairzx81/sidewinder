/*--------------------------------------------------------------------------

@sidewinder/redis

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

export type TopicCallbackFunction = (value: unknown) => any
export type TopicHandle = number

export class Topic {
  private readonly subscriptions: Map<TopicHandle, TopicCallbackFunction>
  private ordinal: TopicHandle
  constructor() {
    this.subscriptions = new Map<TopicHandle, TopicCallbackFunction>()
    this.ordinal = 0
  }
  public register(callback: TopicCallbackFunction): number {
    const handle = this.ordinal++
    this.subscriptions.set(handle, callback)
    return handle
  }

  public unregister(handle: number) {
    this.subscriptions.delete(handle)
  }

  public send(value: unknown) {
    for (const callback of this.subscriptions.values()) {
      callback(value)
    }
  }
}

export namespace Topics {
  const topics = new Map<string, Topic>()
  export function register(name: string, callback: TopicCallbackFunction): TopicHandle {
    if (!topics.has(name)) topics.set(name, new Topic())
    const topic = topics.get(name)!
    return topic.register(callback)
  }
  export function unregister(name: string, handle: TopicHandle): void {
    if (!topics.has(name)) return
    const topic = topics.get(name)!
    return topic.unregister(handle)
  }
  export function send(name: string, value: unknown) {
    if (!topics.has(name)) return
    const topic = topics.get(name)!
    topic.send(value)
  }
}
