import { EventHandler, EventListener } from '@sidewinder/events'

export interface MessageEvent {
    data: Uint8Array
}
export interface CloseEvent {

}
export interface ErrorEvent {

}

export abstract class ServiceSocket {
    abstract send(data: Uint8Array): void
    abstract close(): void
    abstract on(event: 'message', handler: EventHandler<MessageEvent>): EventListener
    abstract on(event: 'error', handler: EventHandler<ErrorEvent>): EventListener
    abstract on(event: 'close', handler: EventHandler<CloseEvent>): EventListener
}