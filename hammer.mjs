import { compilePackage, packPackage } from './build/index'

// -------------------------------------------------------------
// Clean
// -------------------------------------------------------------

export async function clean() {
    await folder('target').delete()
}

// -------------------------------------------------------------
// Start
// -------------------------------------------------------------

export async function start(example = 'basic') {
    await Promise.all([
        shell(`hammer run example/${example}/server/index.ts --dist target/example/${example}/server`),
        shell(`hammer serve example/${example}/client/index.html --dist target/example/${example}/client`)
    ])
}

// -------------------------------------------------------------
// Test
// -------------------------------------------------------------

export async function test(filter = '') {
    await shell(`hammer build ./tests/index.ts --dist target/tests --platform node`)
    await shell(`mocha target/tests/index.js -g "${filter}"`)
}

// -------------------------------------------------------------
// Build
// -------------------------------------------------------------

const VERSION = '0.8.33'

export async function build(target = 'target/build') {
    await clean()
    await Promise.all([
        compilePackage(target, 'async',      VERSION, 'Sidewinder Async'),
        compilePackage(target, 'channel',    VERSION, 'Sidewinder Channel'),
        compilePackage(target, 'client',     VERSION, 'Sidewinder Client'),
        compilePackage(target, 'contract',   VERSION, 'Sidewinder Contract'),
        compilePackage(target, 'encoder',    VERSION, 'Sidewinder Encoder'),
        compilePackage(target, 'events',     VERSION, 'Sidewinder Events'),
        compilePackage(target, 'mongo',      VERSION, 'Sidewinder Mongo'),
        compilePackage(target, 'platform',   VERSION, 'Sidewinder Platform'),
        compilePackage(target, 'server',     VERSION, 'Sidewinder Server'),
        compilePackage(target, 'token',      VERSION, 'Sidewinder Token'),
        compilePackage(target, 'type',       VERSION, 'Sidewinder Type'),
        compilePackage(target, 'validator',  VERSION, 'Sidewinder Validator'),
    ])
    await packPackage(target, 'async')
    await packPackage(target, 'channel')
    await packPackage(target, 'client')
    await packPackage(target, 'contract')
    await packPackage(target, 'encoder')
    await packPackage(target, 'events')
    await packPackage(target, 'mongo')
    await packPackage(target, 'platform')
    await packPackage(target, 'server')
    await packPackage(target, 'token')
    await packPackage(target, 'type')
    await packPackage(target, 'validator')   
}

// -------------------------------------------------------------
// Publish
// -------------------------------------------------------------

export async function publishPackage(name) {
    await shell(`cd target/build/${name} && npm publish sidewinder-${name}-${VERSION}.tgz --access=public`)
}

export async function publish(target = 'target/build') {
    await publishPackage('async')
    await publishPackage('channel')
    await publishPackage('client')
    await publishPackage('contract')
    await publishPackage('encoder')
    await publishPackage('events')
    await publishPackage('mongo')
    await publishPackage('platform')
    await publishPackage('server')
    await publishPackage('token')
    await publishPackage('type')
    await publishPackage('validator')
}