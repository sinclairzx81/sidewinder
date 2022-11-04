import { Query } from '@sidewinder/query'

const expr = Query(`
    name === 'dave' || 
    emails in ['dave@domain.com', 'smith@gmail.com']
    `)

console.log(expr)
