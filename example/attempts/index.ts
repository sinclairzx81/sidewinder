import { Retry } from '@sidewinder/async'

async function start() {
  const result = await Retry.run(
    (attempt) => {
      console.log('attempt', attempt)
      throw 10
      return 10
    },
    {
      multiplier: 1.9,
    },
  )
  console.log(result)
}

start()
