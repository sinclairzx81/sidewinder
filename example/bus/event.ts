import { Type, Static } from '@sidewinder/type'

export type Hello = Static<typeof Hello>
export const Hello = Type.Object({
    type: Type.Literal('Hello')
})

export type SystemEvent = Static<typeof SystemEvent>
export const SystemEvent = Type.Union([
    Hello,
])
