export namespace Environment {
    
    /** Resolves the JavaScript environment */
    export function resolve(): 'node' | 'browser' {
        return typeof window === 'undefined' ? 'node' : 'browser'
    }
}