import * as fs   from 'fs'
import * as path from 'path'

export interface Package { 
    name:    string, 
    version: string, 
    local:   boolean 
}

// -----------------------------------------------------------------------
// Resolve Local and Remote Packages
// -----------------------------------------------------------------------

export function * resolveFromPackageJson(version: string) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    for(const [name, version] of Object.entries<string>(packageJson.dependencies)) {
        yield { name, version, local: false }
    } 
}

export function * resolveFromTsConfigJson(version: string) {
    const config = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
    for(const module of Object.keys(config.compilerOptions.paths)) {
        // This check omits packages with sub modules. Examples of this 
        // include the @sidewinder/type package which houses the sub 
        // packages @sidewinder/type/compiler, @sidewinder/type/conditional, 
        // @sidewinder/type/errors, etc. We omit these from the package 
        // dependencies as these are just compiled with the package.
        if( module.split('/').length !== 2) continue
        yield { name: module, version, local: true }
    }
}

export function * getPackages(version: string) {
    yield * resolveFromPackageJson(version)
    yield * resolveFromTsConfigJson(version)
}

// -----------------------------------------------------------------------
// Directory Package Dependencies
// -----------------------------------------------------------------------

function * enumerateFileContents(directory: string): Generator<string> {
    for(const content of fs.readdirSync(directory)) {
        const filepath = path.join(directory, content)
        const stat = fs.statSync(filepath)
        if(stat.isDirectory()) yield * enumerateFileContents(filepath)
        const extname = path.extname(filepath)
        if(extname !== '.ts' && extname !== '.tsx') continue
        yield fs.readFileSync(filepath, 'utf8')
    }
}

function * getFileImports(content: string) {
    const regex = /import[^']+(?= from ['"](.*)['"])/gm
    while(true) {
        const match = regex.exec(content)
        if(match) yield match[1]
        else return
    }
}

function * getImportDependencies(content: string, packages: Package[]) {
    for(const importName of getFileImports(content)) {
        for(const {name} of packages) {
            if(importName === name) yield name
        }
    }
}

/** Gets package dependencies in the given directory */
export function getDependencies(directory: string, version: string) {
    
    const packages = [...getPackages(version)]
    const set      = new Set<string>()
    for(const content of enumerateFileContents(directory)) {
        for(const name of getImportDependencies(content, packages)) {
           set.add(name)
        }
    }
    
    return [...set].map(name => packages.find(p => p.name === name)!).sort((a, b) => {
       return a.name.localeCompare(b.name)
    })
}