import { Retry } from '@sidewinder/async'

async function start() {
  const result = await Retry.run((attempt) => {
    console.log('attempt', attempt)
    return 10
  }, {
    attempts: 10,
    multiplier: 0.9
  })
  console.log(result)
}

start()

