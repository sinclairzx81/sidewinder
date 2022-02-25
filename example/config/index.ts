import { Type, ConfigurationResolver } from '@sidewinder/config'

const resolver = new ConfigurationResolver(Type.Object({
    port: Type.Number(),
    mongo: Type.Object({
        host: Type.String({}),
        port: Type.Integer()
    })
}), {
    MONGO_PORT: 1000,
    PORT: 5000
}, [
    '--mongo-host', 'mongoi'
])

console.log(resolver.resolve())