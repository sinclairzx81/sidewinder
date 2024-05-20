import { Delay, Lockable } from '@sidewinder/async'
import { RedisConnect, RedisMutex, MemoryMutexOptions } from '@sidewinder/redis'

async function testing(lockable: Lockable, index: number) {
  const lock = await lockable.lock().catch(() => null)
  if (lock === null) return console.log('fail')
  await Delay.wait(10)
  lock.dispose()
  return index
}
async function start() {
  const options = { resource: 'testing', lifetime: 4000 }
  const resourceLock = new RedisMutex(await RedisConnect.connect('redis://localhost:6379'), options)
  // const resourceLock = new MemoryResourceMutex(options)
  for (let i = 0; i < 100; i++) {
    testing(resourceLock, i).then((value) => console.log('done', value))
  }
}
start()
