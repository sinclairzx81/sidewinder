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

export async function start() {
    const external = "zlib https http events net crypto stream url tls"
    await Promise.all([
        shell('hammer run example/server/index.ts --dist target/example/server'),
        shell(`hammer serve example/client/index.html --dist target/example/client --minify --external "${external}"`)
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

const VERSION = '0.8.17'

export async function build(target = 'target/build') {
    await clean()
    await Promise.all([
        compilePackage(target, 'client',   VERSION, 'SideWinder Client'),
        compilePackage(target, 'contract', VERSION, 'SideWinder Contract'),
        compilePackage(target, 'server',   VERSION, 'SideWinder Server'),
        compilePackage(target, 'shared',   VERSION, 'SideWinder Shared'),
    ])
    await packPackage(target, 'client')
    await packPackage(target, 'contract')
    await packPackage(target, 'server')
    await packPackage(target, 'shared')
}

// -------------------------------------------------------------
// Publish
// -------------------------------------------------------------

export async function publish(target = 'target/build') {
    await shell(`cd target/build/contract && npm publish sidewinder-contract-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/shared && npm publish sidewinder-shared-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/server && npm publish sidewinder-server-${VERSION}.tgz --access=public`)
    await shell(`cd target/build/client && npm publish sidewinder-client-${VERSION}.tgz --access=public`)
}