import { Value } from '@sidewinder/value'

setInterval(() => {
    const X = Value.Hash({
        a1: Math.random(),
        a2: Math.random(),
        a3: Math.random(),
        a4: Math.random(),
        a5: Math.random(),
        a6: Math.random(),
        a7: Math.random(),
    })
    console.log(X.toString(16))
})

