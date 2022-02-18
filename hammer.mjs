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

export async function test() {
    await shell(`hammer build ./tests/index.ts --dist target/tests --platform node`)
    await shell(`mocha target/tests/index.js`)
}

// -------------------------------------------------------------
// Build
// -------------------------------------------------------------

const VERSION = '0.8.29'

export async function build(target = 'target/build') {
    await clean()
    await Promise.all([
        compilePackage(target, 'client',     VERSION, 'Sidewinder Client'),
        compilePackage(target, 'contract',   VERSION, 'Sidewinder Contract'),
        compilePackage(target, 'mongo',      VERSION, 'Sidewinder Mongo'),
        compilePackage(target, 'server',     VERSION, 'Sidewinder Server'),
        compilePackage(target, 'shared',     VERSION, 'Sidewinder Shared'),
        compilePackage(target, 'type',       VERSION, 'Sidewinder Type'),
        compilePackage(target, 'validator',  VERSION, 'Sidewinder Validator'),
    ])
    await packPackage(target, 'client')
    await packPackage(target, 'contract')
    await packPackage(target, 'mongo')
    await packPackage(target, 'server')
    await packPackage(target, 'shared')
    await packPackage(target, 'type')
    await packPackage(target, 'validator')   
}

// -------------------------------------------------------------
// Publish
// -------------------------------------------------------------

export async function publish(target = 'target/build') {
    await shell(`cd target/build/shared && npm publish sidewinder-shared-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/contract && npm publish sidewinder-contract-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/mongo && npm publish sidewinder-mongo-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/server && npm publish sidewinder-server-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/client && npm publish sidewinder-client-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/type && npm publish sidewinder-type-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/validator && npm publish sidewinder-validator-${VERSION}.tgz --access=public`)
}