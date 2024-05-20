import { Lock } from '@sidewinder/async'

export interface ResourceLock {
  lock(): Promise<Lock>
}
