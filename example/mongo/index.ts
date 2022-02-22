import { Type, Static, MongoDatabase, MongoCollection } from '@sidewinder/mongo'
import { Db } from 'mongodb'

// --------------------------------------------------------------------------
// Database Schematic
// --------------------------------------------------------------------------

const User = Type.Object({
    _id:   Type.ObjectId(),
    name:  Type.String(),
    email: Type.String({ format: 'email' })
})

const Order = Type.Object({
    _id:     Type.ObjectId(),
    user_id: Type.ObjectId(),
    value:   Type.String()
})

const Database = Type.Database({
    users:  User,
    orders: Order
})

// --------------------------------------------------------------------------
// Database
// --------------------------------------------------------------------------

export class ApplicationDatabase extends MongoDatabase<typeof Database> {
    private readonly users:  MongoCollection<typeof User>
    private readonly orders: MongoCollection<typeof Order>

    constructor(db: Db) {
        super(Database, db)
        this.users = this.collection('users')
        this.orders = this.collection('orders')
    }

    /** Creates a new user record */
    public async createUser(user: Omit<Static<typeof User>, '_id'>): Promise<string> {
        const result = await this.users.insertOne({  _id: this.id(), ...user })
        return result.insertedId
    }

    /** Creates a new order record */
    public async createOrder(order: Omit<Static<typeof Order>, '_id'>): Promise<string> {
        const result = await this.orders.insertOne({ _id: this.id(), ...order })
        return result.insertedId
    }

    /** Creates a new order record */
    public getOrdersFor(user_id: string) {
        return this.orders.find({ user_id })
    }
}

async function start() {
    const database = new ApplicationDatabase(null as any) // requires a mongo Db instance
    const user_id = await database.createUser({ name: 'dave', email: 'dave@domain.com' })
    await database.createOrder({ user_id, value: 'beer' })
    await database.createOrder({ user_id, value: 'scotch' })
    await database.createOrder({ user_id, value: 'smokes' })

    for await(const order of database.getOrdersFor(user_id).skip(0).take(10)) {
        // ...
    }
}

