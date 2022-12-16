// -------------------------------------------------------------------------
// Micron Build Script
// -------------------------------------------------------------------------

import { shell, file } from '@sinclair/hammer'
import { Package, getDependencies } from './packages'

// -------------------------------------------------------------------------
// Compilation and Assets
// -------------------------------------------------------------------------

async function compileTypeScript(target: string, packageName: string, dependencies: Package[]) {
  const nested = dependencies.some((dependency) => dependency.local)
  const outdir = nested ? `${target}` : `${target}/${packageName}`
  await shell(`tsc --project packages/${packageName}/tsconfig.json --outDir ${outdir} --declaration`)
}

async function compilePackageJson(target: string, packageName: string, dependentPackages: Package[], version: string, description: string) {
  const dependencies = dependentPackages.reduce((acc, pack) => ({ [pack.name]: pack.version, ...acc }), {})
  await file(`${target}/${packageName}/package.json`).write(
    JSON.stringify(
      {
        name: `@sidewinder/${packageName}`,
        description: description,
        version: version,
        author: 'sinclairzx81',
        license: 'MIT',
        main: 'index.js',
        types: 'index.d.ts',
        repository: {
          type: 'git',
          url: 'https://github.com/sinclairzx81/sidewinder',
        },
        dependencies,
      },
      null,
      2,
    ),
  )
}

async function compileReadme(target: string, packageName: string) {
  if (!(await file(`packages/${packageName}/readme.md`).exists())) throw Error(`Package '${packageName}' has no readme.md file`)
  const content = await file(`packages/${packageName}/readme.md`).read('utf8')
  await file(`${target}/${packageName}/readme.md`).write(content)
}

async function compileLicense(target: string, packageName: string) {
  const content = await file(`license`).read('utf8')
  await file(`${target}/${packageName}/license`).write(content)
}

export async function compilePackage(target: string, packageName: string, version: string, description: string) {
  const dependencies = getDependencies(`packages/${packageName}`, version)
  console.log(
    'build:',
    packageName,
    dependencies.map((dependency) => dependency.name),
  )
  await compileTypeScript(target, packageName, dependencies)
  await compilePackageJson(target, packageName, dependencies, version, description)
  await compileReadme(target, packageName)
  await compileLicense(target, packageName)
  console.log(packageName, 'complete')
}

// -------------------------------------------------------------------------
// Npm Package Publishing
// -------------------------------------------------------------------------

export async function packPackage(target: string, packageName: string) {
  await shell(`cd ${target}/${packageName} && npm pack`)
}
