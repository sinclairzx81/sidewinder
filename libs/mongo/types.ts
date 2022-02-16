import { Static, SchemaOptions, TObject, TSchema, TypeBuilder, TProperties } from '@sidewinder/contract'
import { matchArguments } from './arguments'

export type TCollections = Record<string, TObject>
export type TIndices = Record<string, any>

export interface TDatabase<
    Collections extends TCollections = TCollections,
    Indices extends TIndices = TIndices
    > {
    $static: { [K in keyof Collections['collections']]: Static<Collections['collections'][K]> }
    kind: 'Database'
    type: 'object'
    collections: Collections
    indices: Indices
}

export class DatabaseTypeBuilder extends TypeBuilder {
    /** Creates a database schematic with indices */
    public Database<Collections extends TCollections, Indices extends TIndices>(collections: Collections, indices: Indices): TDatabase<Collections, Indices>
    /** Creates a database schematic */
    public Database<Collections extends TCollections>(collections: Collections): TDatabase<Collections, {}>
    /** Creates a database schemaic */
    public Database(...args: any[]): any {
        return matchArguments(args, {
            2: (collections, indices) => this.Create({ kind: 'Database', type: 'object', collections, indices }),
            1: (collections) => this.Create({ kind: 'Database', type: 'object', collections, indices: {} }),
            _: () => { throw new Error('Invalid Database() arguments') }
        })
    }

    /** Creates a Mongo Identifier */
    public ObjectId(options: SchemaOptions = {}) {
        return super.RegEx(/^[0-9a-fA-F]{24}$/, options)
    }
}


export const Type = new DatabaseTypeBuilder()