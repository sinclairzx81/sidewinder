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

const VERSION = '0.8.28'

export async function build(target = 'target/build') {
    await clean()
    await Promise.all([
        compilePackage(target, 'client',   VERSION, 'Sidewinder Client'),
        compilePackage(target, 'contract', VERSION, 'Sidewinder Contract'),
        compilePackage(target, 'debug',    VERSION, 'Sidewinder Debug'),
        compilePackage(target, 'react',    VERSION, 'Sidewinder React'),
        compilePackage(target, 'server',   VERSION, 'Sidewinder Server'),
        compilePackage(target, 'shared',   VERSION, 'Sidewinder Shared'),
    ])
    await packPackage(target, 'client')
    await packPackage(target, 'contract')
    await packPackage(target, 'debug')
    await packPackage(target, 'react')
    await packPackage(target, 'server')
    await packPackage(target, 'shared')    
}

// -------------------------------------------------------------
// Publish
// -------------------------------------------------------------

export async function publish(target = 'target/build') {
    // await shell(`cd target/build/shared && npm publish sidewinder-shared-${VERSION}.tgz --access=public`)
    // await shell(`cd target/build/contract && npm publish sidewinder-contract-${VERSION}.tgz --access=public`)
    // await shell(`cd target/build/react && npm publish sidewinder-react-${VERSION}.tgz --access=public`)
    // await shell(`cd target/build/server && npm publish sidewinder-server-${VERSION}.tgz --access=public`)
    // await shell(`cd target/build/client && npm publish sidewinder-client-${VERSION}.tgz --access=public`)
}