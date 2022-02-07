import { WebClient, WebProxy } from '@sidewinder/client'
import { Contract }         from '../shared/index'

const client = WebProxy(new WebClient(Contract, 'http://localhost:5001/math'))
const result = await client.add(1, 2)


fetch('http://localhost:5001/math', {
    method: 'post',
    headers: {
        'Content-Type': 'application/x-sidewinder'
    },
    body: JSON.stringify({
        jsonrpc: "2.0",
        id:      "1",
        method:  "add",
        params:  [1, true],
        
    })
}).then(res => res.json()).then(result => {
    console.log(result)
})

 
