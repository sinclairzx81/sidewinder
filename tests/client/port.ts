let port = 9000
export function nextPort() {
    const next = port++
    return next
}