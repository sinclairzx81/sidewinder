import { Type, Configuration } from '@sidewinder/config'



const configuration = Configuration(Type.Object({
    port: Type.Integer({ default: 5000, description: 'Server port'  }),
    mongo: Type.Object({
        host: Type.String({ description: 'Mongo host'}),
        port: Type.Integer({ description: 'Mongo port' })
    }),
    redis: Type.Object({
        host: Type.String({ default: 'localhost', description: 'Redis host' }),
        port: Type.Integer({ default: '6379', description: 'Redis port' })
    })
}))

console.log(configuration.resolve())
