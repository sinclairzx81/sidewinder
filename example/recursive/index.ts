// -----------------------------------------------------------------
// This example tests recursive type inference and validation
// through sidewinder services.
// -----------------------------------------------------------------

import { Type, Host, WebService } from '@sidewinder/server'
import { WebClient } from '@sidewinder/client'

// -----------------------------------------------------------
// Node
// -----------------------------------------------------------

const Node = Type.Tuple([
    Type.Rec(Self => Type.Object({
        id: Type.String(),
        nodes: Type.Array(Self)
    }))
])

// -----------------------------------------------------------
// Contract
// -----------------------------------------------------------

const GraphContract = Type.Contract({
    server: {
        echo: Type.Function([Node], Node)
    }
})

// -----------------------------------------------------------
// Service
// -----------------------------------------------------------

export class GraphService extends WebService<typeof GraphContract> {
    constructor() {
        super(GraphContract)
    }

    public echo = super.method('echo', (context, node) => {
        return node
    })
}

// -----------------------------------------------------------
// Host
// -----------------------------------------------------------

const host = new Host()

host.use('/graph', new GraphService())

host.listen(5000)

// -----------------------------------------------------------
// Client
// -----------------------------------------------------------

async function start() {

    const client = new WebClient(GraphContract, 'http://localhost:5000/graph')

    const result = await client.call('echo', [{
        id: 'A',
        nodes: [
            { id: 'B', nodes: [{
                id: 'A',
                nodes: [
                    { id: 'B', nodes: [] },
                    { id: 'C', nodes: [] },
                ]
            }] },
            { id: 'C', nodes: [] },
        ]
    }])
    
    console.log(JSON.stringify(result, null, 2)) 
}

start()
