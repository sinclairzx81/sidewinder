import { compilePackage, packPackage } from './build/index'

// -------------------------------------------------------------
// Packages
// -------------------------------------------------------------

const version = '0.8.39'
const packages = [
    ['async',     version, 'Sidewinder Async'],
    ['channel',   version, 'Sidewinder Channel'],
    ['client',    version, 'Sidewinder Client'],
    ['contract',  version, 'Sidewinder Contract'],
    ['events',    version, 'Sidewinder Events'],
    ['hashing',   version, 'Sidewinder Hashing'],
    ['mongo',     version, 'Sidewinder Mongo'],
    ['platform',  version, 'Sidewinder Platform'],
    ['redis',     version, 'Sidewinder Redis'],
    ['server',    version, 'Sidewinder Server'],
    ['token',     version, 'Sidewinder Token'],
    ['type',      version, 'Sidewinder Type'],
    ['validator', version, 'Sidewinder Validator']
]

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
    // run-as: node application
    if(await file(`example/${example}/index.ts`).exists()) {
        return await shell(`hammer run example/${example}/index.ts --dist target/example/${example}`)
    } 
    // run-as: node and browser application
    return await Promise.all([
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

export async function build(target = 'target/build') {
    await clean()
    await Promise.all(packages.map(([ name, version, description]) => compilePackage(target, name, version, description)))
    for(const [name] of packages) await packPackage(target, name)
}

// -------------------------------------------------------------
// Publish
// -------------------------------------------------------------

export async function publish(target = 'target/build') {
    for(const [name, version] of packages) await shell(`cd ${target}/${name} && npm publish sidewinder-${name}-${version}.tgz --access=public`)
}