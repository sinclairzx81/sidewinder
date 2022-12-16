import { compilePackage, packPackage } from './build/index'

// -------------------------------------------------------------
// Packages
// -------------------------------------------------------------

const version = '0.12.4'
const packages = [
    ['async',     version, 'Sidewinder Async'],
    ['buffer',    version, 'Sidewinder Buffer'],
    ['channel',   version, 'Sidewinder Channel'],
    ['client',    version, 'Sidewinder Client'],
    ['config',    version, 'Sidewinder Config'],
    ['contract',  version, 'Sidewinder Contract'],
    ['events',    version, 'Sidewinder Events'],
    ['fetch',     version, 'Sidewinder Fetch'],
    ['host',      version, 'Sidewinder Host'],
    ['mime',      version, 'Sidewinder Mime'],
    ['mongo',     version, 'Sidewinder Mongo'],
    ['path',      version, 'Sidewinder Path'],
    ['platform',  version, 'Sidewinder Platform'],
    ['query',     version, 'Sidewinder Query'],
    ['redis',     version, 'Sidewinder Redis'],
    ['result',    version, 'Sidewinder Result'],
    ['service',   version, 'Sidewinder Service'],
    ['token',     version, 'Sidewinder Token'],
    ['type',      version, 'Sidewinder Type'],
    ['validator', version, 'Sidewinder Validator'],
    ['value',     version, 'Sidewinder Value'],
    ['websocket', version, 'Sidewinder WebSocket'],
]

// -------------------------------------------------------------
// Clean
// -------------------------------------------------------------

export async function clean() {
    await folder('target').delete()
}

// -------------------------------------------------------------
// Format
// -------------------------------------------------------------

export async function format() {
    await shell('prettier --no-semi --single-quote --print-width 240 --trailing-comma all --write packages example tests build')
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

export async function publish(otp, target = 'target/build') {
    for(const [name, version] of packages) await shell(`cd ${target}/${name} && npm publish sidewinder-${name}-${version}.tgz --access=public --otp ${otp}`)
    // tag version
    await shell(`git tag ${version}`)
    await shell(`git push origin ${version}`)
}