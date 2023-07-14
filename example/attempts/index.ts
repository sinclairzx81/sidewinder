import { Retry } from '@sidewinder/async'

Retry.run(
  async (attempt) => {
    console.log('attempt', attempt)
    if (attempt === 10) return 'ok'
    throw Error('failed')
  },
  {
    attempts: 32,
    delay: 500,
  },
)
  .then(console.log)
  .catch(console.log)
