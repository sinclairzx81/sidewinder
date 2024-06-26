import { Type, Configuration } from '@sidewinder/config'

const configuration = Configuration(
  Type.Object({
    X: Type.Number(),
    Y: Type.Number(),
    Z: Type.Number(),
  }),
)
const environment = configuration.resolve({
  X: 1,
  Y: 2,
  Z: 3,
})

console.log(environment)
