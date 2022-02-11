import {TSchema, TArray, TBoolean, TNumber, TObject, TString } from '@sidewinder/contract'

export namespace Defaults {
    function defaultArray(schema: TArray): unknown[] {
        if(schema.minItems !== undefined) {
            return Array.from({ length: schema.minItems }).map(item => defaultSchema(schema.items))
        } else {
            return schema.default || []
        }
    }
    
    function defaultBoolean(schema: TBoolean): boolean {
        return schema.default !== undefined ? schema.default : false
    }
    
    function defaultNumber(schema: TNumber): number {
        return schema.default !== undefined ? schema.default : 0
    }
    
    function defaultObject(schema: TObject): object {
        return schema.default || Object.entries(schema.properties).reduce((acc, [key, schema]) => {
            return {...acc, [key]: defaultSchema(schema)}
        }, {})
    }
    
    function defaultString(schema: TString): string {
        return schema.default || ''
    }

    function defaultSchema(schema: TSchema)  {
        switch(schema.kind) {
            case 'Array': return defaultArray(schema as TArray)
            case 'Boolean': return defaultBoolean(schema as TBoolean)
            case 'Number': return defaultNumber(schema as TNumber)
            case 'Object': return defaultObject(schema as TObject)
            case 'String': return defaultString(schema as TString)
        }
    }

    export function resolve<T extends TSchema>(schema: T): T['$static'] {
        return defaultSchema(schema)
    }
}
