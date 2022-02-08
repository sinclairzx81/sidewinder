/*--------------------------------------------------------------------------

@sidewinder/shared

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

// --------------------------------------------------------
// EventListener
// --------------------------------------------------------

export class EventListener  {
    constructor(private readonly callback: () => any) {}
    
    public dispose() {
        this.callback()
    }
}

// --------------------------------------------------------
// EventHandler<T>
// --------------------------------------------------------

export type EventHandler<T> = (value: T) => any

// --------------------------------------------------------
// EventHandler<T>
// --------------------------------------------------------

export class Event<T> {
    private readonly subscriptions = new Set<readonly [boolean, EventHandler<T>]>()
    
    public on(handler: EventHandler<T>): EventListener {
        const subscription = [false, handler] as const
        this.subscriptions.add(subscription)
        return new EventListener(() => this.subscriptions.delete(subscription))
    }

    public once(handler: EventHandler<T>): EventListener {
        const subscription = [true, handler] as const
        this.subscriptions.add(subscription)
        return new EventListener(() => this.subscriptions.delete(subscription))
    }

    public send(value: T): any {
        for(const subscriber of this.subscriptions) {
            const [once, handler] = subscriber
            if(once) this.subscriptions.delete(subscriber)
            handler(value)
        }
    }

    public dispose() {
        this.subscriptions.clear()
    }
}

// --------------------------------------------------------
// Events
// --------------------------------------------------------

export class Events {
    private readonly events = new Map<string, Event<any>>()

    /** Subscribes to an event */
    public on<T = unknown>(name: string, handler: EventHandler<T>): EventListener {
        if(!this.events.has(name)) this.events.set(name, new Event())
        const event = this.events.get(name)!
        return event.on(handler)
    }

    /** Subscribes once to an event */
    public once<T = unknown>(name: string, handler: EventHandler<T>): EventListener {
        if(!this.events.has(name)) this.events.set(name, new Event())
        const event = this.events.get(name)!
        return event.once(handler)
    }

    /** Sends a value to subscribers of this event */
    public send<T = unknown>(name: string, value: T) {
        if(!this.events.has(name)) return
        const event = this.events.get(name)!
        event.send(value)
    }

    /** Disposes of this event */
    public dispose() {
        for(const [key, event] of this.events) {
            this.events.delete(key)
            event.dispose()   
        }
    }
}